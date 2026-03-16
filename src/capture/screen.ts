import { execFile } from "child_process";
import { promisify } from "util";
import { mkdirSync } from "fs";
import { dirname } from "path";

const execFileAsync = promisify(execFile);

/**
 * Resolve an app name to its best visible window ID.
 * Uses Swift + CGWindowListCopyWindowInfo for reliable cross-app resolution.
 * Picks the largest on-screen, layer-0 window matching the app name.
 */
export async function resolveWindowId(appName: string): Promise<number> {
  // Swift is always available on macOS and can access CoreGraphics directly
  const swiftCode = `
import Cocoa
let app = CommandLine.arguments[1].lowercased()
let options: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
guard let list = CGWindowListCopyWindowInfo(options, kCGNullWindowID) as? [[String: Any]] else { exit(1) }

var best: (id: Int, area: Int) = (0, 0)
for win in list {
    let owner = (win[kCGWindowOwnerName as String] as? String ?? "").lowercased()
    let layer = win[kCGWindowLayer as String] as? Int ?? -1
    guard owner.contains(app), layer == 0 else { continue }
    let wid = win[kCGWindowNumber as String] as? Int ?? 0
    let bounds = win[kCGWindowBounds as String] as? [String: Any] ?? [:]
    let w = bounds["Width"] as? Int ?? 0
    let h = bounds["Height"] as? Int ?? 0
    let area = w * h
    if area > best.area { best = (wid, area) }
}
if best.id > 0 { print(best.id) } else { exit(1) }
`;

  try {
    const { stdout } = await execFileAsync(
      "swift",
      ["-e", swiftCode, appName],
      { timeout: 15000 }
    );
    const windowId = parseInt(stdout.trim(), 10);
    if (!isNaN(windowId) && windowId > 0) return windowId;
  } catch {
    // Swift resolution failed
  }

  throw new Error(
    `No running process for '${appName}'. Ensure the app is running.`
  );
}

/**
 * Take a screenshot of a specific macOS window.
 */
export async function screenCapture(
  windowId: number,
  outputPath: string
): Promise<void> {
  mkdirSync(dirname(outputPath), { recursive: true });
  await execFileAsync(
    "screencapture",
    ["-l", String(windowId), "-x", outputPath],
    { timeout: 10000 }
  );
}

/**
 * Start recording the screen. Returns a handle to stop recording.
 * Note: screencapture -v does not support per-window recording (-l flag
 * exits immediately on modern macOS). Records full screen instead.
 * windowId parameter is accepted for API consistency but not used for video.
 */
export function startScreenRecording(
  _windowId: number,
  outputPath: string
): { stop: () => Promise<void>; process: ReturnType<typeof execFile> } {
  mkdirSync(dirname(outputPath), { recursive: true });
  const proc = execFile(
    "screencapture",
    ["-v", "-x", outputPath],
    { timeout: 60000 }
  );

  return {
    process: proc,
    stop: () =>
      new Promise<void>((resolve) => {
        proc.on("close", () => resolve());
        proc.kill("SIGINT");
      }),
  };
}
