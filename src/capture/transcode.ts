import { execFile } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";

const execFileAsync = promisify(execFile);

function checkFfmpeg(): void {
  // We'll validate on first use
}

async function runFfmpeg(args: string[]): Promise<void> {
  try {
    await execFileAsync("ffmpeg", args, { timeout: 60000 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("ENOENT")) {
      throw new Error("ffmpeg not found. Install with: brew install ffmpeg");
    }
    throw err;
  }
}

export async function transcodeToMp4(
  inputPath: string,
  outputPath: string
): Promise<void> {
  checkFfmpeg();
  await runFfmpeg([
    "-i", inputPath,
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "23",
    "-pix_fmt", "yuv420p",
    "-an",
    "-y",
    outputPath,
  ]);
}

export async function extractThumbnail(
  videoPath: string,
  outputPath: string
): Promise<void> {
  checkFfmpeg();
  await runFfmpeg([
    "-i", videoPath,
    "-vframes", "1",
    "-vf", "scale=320:-1",
    "-y",
    outputPath,
  ]);
}

export async function getVideoDuration(videoPath: string): Promise<number> {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "quiet",
      "-show_entries", "format=duration",
      "-of", "csv=p=0",
      videoPath,
    ], { timeout: 10000 });
    const seconds = parseFloat(stdout.trim());
    return isNaN(seconds) ? 0 : Math.round(seconds * 1000);
  } catch {
    return 0;
  }
}

export function isTranscodeNeeded(filePath: string): boolean {
  return filePath.endsWith(".webm") || filePath.endsWith(".mov");
}
