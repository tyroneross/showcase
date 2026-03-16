// --- Capture Index ---

export interface ShowcaseIndex {
  version: "1";
  captures: CaptureEntry[];
}

export interface CaptureEntry {
  id: string; // "cap_" + crypto.randomBytes(6).base64url
  created_at: number; // Unix ms
  type: "screenshot" | "video";
  format: "png" | "mp4";
  size_bytes: number;
  duration_ms?: number; // Video only

  // Source
  source: "web" | "screen" | "simulator";
  platform: "web" | "macos" | "ios" | "electron";
  url?: string;
  viewport?: Viewport;
  selector?: string;
  device_name?: string;

  // User metadata
  title?: string;
  feature?: string;
  component?: string;
  tags: string[];
  starred: boolean;

  // Auto-populated context
  git_branch?: string;
  git_commit?: string;
}

export interface Viewport {
  width: number;
  height: number;
  name?: string;
}

// --- Capture Targets ---

export type CaptureSource = "web" | "screen" | "simulator";

export interface CaptureTarget {
  source: CaptureSource;
  platform: "web" | "macos" | "ios";
  url?: string;
  appName?: string;
  deviceName?: string;
  deviceUdid?: string;
}

// --- Capture Options ---

export type ViewportPreset = "desktop" | "mobile" | "tablet";

export const VIEWPORT_PRESETS: Record<ViewportPreset, Viewport> = {
  desktop: { width: 1280, height: 800, name: "desktop" },
  mobile: { width: 390, height: 844, name: "mobile" },
  tablet: { width: 768, height: 1024, name: "tablet" },
};

export interface CaptureOptions {
  target: string; // URL, app name, or sim:<device>
  viewport?: ViewportPreset;
  selector?: string; // CSS selector (web only)
  fullPage?: boolean; // Web only
  delay?: number; // ms before capture
  tags?: string[];
  title?: string;
  feature?: string;
  component?: string;
}

export interface RecordOptions extends CaptureOptions {
  duration?: number; // Seconds (default 5, max 30)
}

// --- Query ---

export interface FindQuery {
  tags?: string[]; // AND filter
  tags_any?: string[]; // OR filter
  feature?: string;
  component?: string;
  platform?: string;
  type?: "screenshot" | "video";
  starred?: boolean;
  since?: string; // ISO date or relative ("7d", "24h")
  query?: string; // Free text across title + tags + feature + component
  limit?: number; // Max results (default 20)
}

export type GalleryGroupBy = "feature" | "date" | "component" | "platform";

export interface ExportOptions {
  ids?: string[];
  feature?: string;
  tags?: string[];
  starred?: boolean;
  output_dir?: string; // Default "./showcase-export"
  format?: "flat" | "by-feature" | "by-date";
  manifest?: boolean; // Generate markdown manifest (default true)
}

// --- Config ---

export interface ShowcaseConfig {
  baseUrl?: string;
  defaultViewport: ViewportPreset;
  video: {
    maxDuration: number;
    defaultDuration: number;
    format: "mp4";
  };
  capture: {
    delay: number;
    fullPage: boolean;
    disableAnimations: boolean;
  };
  cleanup: {
    maxCaptures: number;
    warnAtMb: number;
  };
}

export const DEFAULT_CONFIG: ShowcaseConfig = {
  defaultViewport: "desktop",
  video: { maxDuration: 30, defaultDuration: 5, format: "mp4" },
  capture: { delay: 500, fullPage: false, disableAnimations: true },
  cleanup: { maxCaptures: 500, warnAtMb: 500 },
};

// --- Simulator ---

export interface SimulatorDevice {
  udid: string;
  name: string;
  state: "Booted" | "Shutdown" | "Creating" | string;
  runtime: string;
  platform: "ios" | "watchos";
  isAvailable: boolean;
}

// --- Results ---

export interface CaptureResult {
  entry: CaptureEntry;
  filePath: string;
  base64?: string; // Screenshots only (for MCP image content)
}

export interface RecordResult {
  entry: CaptureEntry;
  filePath: string;
  thumbnailPath?: string;
}
