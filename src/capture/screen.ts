import { execFile, execFileSync } from "child_process";
import { promisify } from "util";
import { mkdirSync } from "fs";
import { dirname } from "path";

const execFileAsync = promisify(execFile);

/**
 * Resolve an app name to its frontmost window ID via AppleScript.
 * Falls back to matching by process name if no window is found.
 */
export async function resolveWindowId(appName: string): Promise<number> {
  // Use AppleScript to get the window ID of the named app
  const script = `
    tell application "System Events"
      set targetProc to first process whose name contains "${appName.replace(/"/g, '\\"')}"
      set targetPid to unix id of targetProc
    end tell
    do shell script "osascript -e 'tell application \\"System Events\\" to tell (first process whose unix id is " & targetPid & ") to get id of first window'"
  `;

  try {
    const { stdout } = await execFileAsync("osascript", ["-e", script], {
      timeout: 10000,
    });
    const windowId = parseInt(stdout.trim(), 10);
    if (!isNaN(windowId)) return windowId;
  } catch {
    // Fall through to CGWindowListCopyWindowInfo approach
  }

  // Fallback: use Python + Quartz to find window by owner name
  const pyScript = `
import Quartz, sys
app = sys.argv[1].lower()
for w in Quartz.CGWindowListCopyWindowInfo(Quartz.kCGWindowListOptionOnScreenOnly, Quartz.kCGNullWindowID):
    owner = w.get(Quartz.kCGWindowOwnerName, "").lower()
    if app in owner and w.get(Quartz.kCGWindowLayer, 999) == 0:
        print(w[Quartz.kCGWindowNumber])
        sys.exit(0)
sys.exit(1)
`;

  try {
    const { stdout } = await execFileAsync(
      "python3",
      ["-c", pyScript, appName],
      { timeout: 10000 }
    );
    const windowId = parseInt(stdout.trim(), 10);
    if (!isNaN(windowId)) return windowId;
  } catch {
    // Neither method worked
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
 * Start recording a macOS window. Returns a handle to stop recording.
 * screencapture -v records video; SIGINT stops it.
 */
export function startScreenRecording(
  windowId: number,
  outputPath: string
): { stop: () => Promise<void>; process: ReturnType<typeof execFile> } {
  mkdirSync(dirname(outputPath), { recursive: true });
  const proc = execFile(
    "screencapture",
    ["-v", "-l", String(windowId), "-x", outputPath],
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
