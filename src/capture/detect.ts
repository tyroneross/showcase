import type { CaptureTarget } from "../types.js";

const URL_PATTERN = /^https?:\/\//i;
const LOCALHOST_PATTERN = /^localhost(:\d+)?/i;
const SIM_PATTERN = /^(sim|simulator):/i;

export function resolveTarget(input: string): CaptureTarget {
  // URLs → web
  if (URL_PATTERN.test(input) || LOCALHOST_PATTERN.test(input)) {
    const url = LOCALHOST_PATTERN.test(input)
      ? `http://${input}`
      : input;
    return { source: "web", platform: "web", url };
  }

  // sim:<device> → simulator
  if (SIM_PATTERN.test(input)) {
    const deviceName = input.replace(SIM_PATTERN, "").trim();
    return { source: "simulator", platform: "ios", deviceName };
  }

  // Everything else → macOS screen capture
  return { source: "screen", platform: "macos", appName: input };
}
