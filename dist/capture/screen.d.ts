import { execFile } from "child_process";
/**
 * Resolve an app name to its best visible window ID.
 * Uses Swift + CGWindowListCopyWindowInfo for reliable cross-app resolution.
 * Picks the largest on-screen, layer-0 window matching the app name.
 */
export declare function resolveWindowId(appName: string): Promise<number>;
/**
 * Take a screenshot of a specific macOS window.
 */
export declare function screenCapture(windowId: number, outputPath: string): Promise<void>;
/**
 * Start recording the screen. Returns a handle to stop recording.
 * Note: screencapture -v does not support per-window recording (-l flag
 * exits immediately on modern macOS). Records full screen instead.
 * windowId parameter is accepted for API consistency but not used for video.
 */
export declare function startScreenRecording(_windowId: number, outputPath: string): {
    stop: () => Promise<void>;
    process: ReturnType<typeof execFile>;
};
//# sourceMappingURL=screen.d.ts.map