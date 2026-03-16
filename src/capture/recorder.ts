import { renameSync, existsSync } from "fs";
import { join } from "path";
import { resolveTarget } from "./detect.js";
import { webRecord } from "./web.js";
import { resolveWindowId, startScreenRecording } from "./screen.js";
import {
  findDevice,
  startSimulatorRecording,
} from "./simulator.js";
import {
  transcodeToMp4,
  extractThumbnail,
  getVideoDuration,
  isTranscodeNeeded,
} from "./transcode.js";
import { loadConfig } from "../config.js";
import { generateId, ensureCaptureDir, getFilePath, getFileSize } from "../storage/media.js";
import { addCapture } from "../storage/index.js";
import type { CaptureEntry, ViewportPreset, RecordResult } from "../types.js";
import { execFileSync } from "child_process";

function getGitContext(): { branch?: string; commit?: string } {
  try {
    const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      timeout: 3000,
      encoding: "utf-8",
    }).trim();
    const commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      timeout: 3000,
      encoding: "utf-8",
    }).trim();
    return { branch, commit };
  } catch {
    return {};
  }
}

export interface RecordClipOptions {
  target: string;
  duration?: number;
  viewport?: ViewportPreset;
  tags?: string[];
  title?: string;
  feature?: string;
  component?: string;
}

export async function recordClip(
  options: RecordClipOptions
): Promise<RecordResult> {
  const config = loadConfig();
  const duration = Math.min(
    options.duration ?? config.video.defaultDuration,
    config.video.maxDuration
  );

  const resolved = resolveTarget(options.target);
  const id = generateId();
  const dir = ensureCaptureDir(id);
  const finalPath = getFilePath(id, "original.mp4");
  const thumbPath = getFilePath(id, "thumb.png");
  const git = getGitContext();

  let viewport: { width: number; height: number; name?: string } = {
    width: 1280,
    height: 800,
    name: "desktop",
  };

  // Hard timeout guard — prevents runaway disk usage
  const hardTimeout = setTimeout(() => {
    throw new Error(`Recording exceeded hard timeout (${duration + 10}s)`);
  }, (duration + 10) * 1000);

  try {
    switch (resolved.source) {
      case "web": {
        const result = await webRecord({
          url: resolved.url!,
          outputDir: dir,
          viewport: options.viewport || config.defaultViewport,
          duration,
          delay: config.capture.delay,
          disableAnimations: config.capture.disableAnimations,
        });

        // Playwright produces WebM — transcode to MP4
        if (result.videoPath && isTranscodeNeeded(result.videoPath)) {
          await transcodeToMp4(result.videoPath, finalPath);
        } else if (result.videoPath && result.videoPath !== finalPath) {
          renameSync(result.videoPath, finalPath);
        }
        viewport = result.viewport;
        break;
      }

      case "screen": {
        const windowId = await resolveWindowId(resolved.appName!);
        const rawPath = join(dir, "raw.mov");
        const recording = startScreenRecording(windowId, rawPath);

        await new Promise((r) => setTimeout(r, duration * 1000));
        await recording.stop();

        // MOV → MP4
        if (existsSync(rawPath)) {
          await transcodeToMp4(rawPath, finalPath);
        }
        viewport = { width: 0, height: 0 };
        break;
      }

      case "simulator": {
        const device = await findDevice(resolved.deviceName!);
        if (!device) {
          throw new Error(
            `No simulator found for '${resolved.deviceName}'. Run: xcrun simctl list devices`
          );
        }
        if (device.state !== "Booted") {
          throw new Error(
            `Simulator '${device.name}' is not booted. Boot with: xcrun simctl boot "${device.udid}"`
          );
        }

        const rawPath = join(dir, "raw.mp4");
        const recording = startSimulatorRecording(device.udid, rawPath);
        await recording.ready;

        await new Promise((r) => setTimeout(r, duration * 1000));
        await recording.stop();

        if (existsSync(rawPath)) {
          renameSync(rawPath, finalPath);
        }
        viewport = { width: 0, height: 0 };
        break;
      }
    }
  } finally {
    clearTimeout(hardTimeout);
  }

  // Generate thumbnail
  let thumbnailPath: string | undefined;
  if (existsSync(finalPath)) {
    try {
      await extractThumbnail(finalPath, thumbPath);
      thumbnailPath = thumbPath;
    } catch {
      // Thumbnail is optional
    }
  }

  const durationMs = existsSync(finalPath)
    ? await getVideoDuration(finalPath)
    : duration * 1000;

  const entry: CaptureEntry = {
    id,
    created_at: Date.now(),
    type: "video",
    format: "mp4",
    size_bytes: getFileSize(finalPath),
    duration_ms: durationMs,
    source: resolved.source,
    platform: resolved.platform,
    url: resolved.url,
    viewport,
    device_name: resolved.deviceName,
    title: options.title,
    feature: options.feature,
    component: options.component,
    tags: options.tags || [],
    starred: false,
    git_branch: git.branch,
    git_commit: git.commit,
  };

  addCapture(entry);

  return { entry, filePath: finalPath, thumbnailPath };
}
