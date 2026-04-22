export interface ShowcaseIndex {
    version: "1";
    captures: CaptureEntry[];
}
export interface CaptureEntry {
    id: string;
    created_at: number;
    type: "screenshot" | "video";
    format: "png" | "mp4";
    size_bytes: number;
    duration_ms?: number;
    source: "web" | "screen" | "simulator";
    platform: "web" | "macos" | "ios" | "electron";
    url?: string;
    viewport?: Viewport;
    selector?: string;
    device_name?: string;
    title?: string;
    feature?: string;
    component?: string;
    tags: string[];
    starred: boolean;
    walkthrough?: {
        step_count: number;
        steps: string[];
    };
    git_branch?: string;
    git_commit?: string;
}
export interface Viewport {
    width: number;
    height: number;
    name?: string;
}
export type CaptureSource = "web" | "screen" | "simulator";
export interface CaptureTarget {
    source: CaptureSource;
    platform: "web" | "macos" | "ios";
    url?: string;
    appName?: string;
    deviceName?: string;
    deviceUdid?: string;
}
export type ViewportPreset = "desktop" | "mobile" | "tablet";
export declare const VIEWPORT_PRESETS: Record<ViewportPreset, Viewport>;
export interface CaptureOptions {
    target: string;
    viewport?: ViewportPreset;
    selector?: string;
    fullPage?: boolean;
    delay?: number;
    tags?: string[];
    title?: string;
    feature?: string;
    component?: string;
}
export interface RecordOptions extends CaptureOptions {
    duration?: number;
}
export interface FindQuery {
    tags?: string[];
    tags_any?: string[];
    feature?: string;
    component?: string;
    platform?: string;
    type?: "screenshot" | "video";
    starred?: boolean;
    since?: string;
    query?: string;
    limit?: number;
}
export type GalleryGroupBy = "feature" | "date" | "component" | "platform";
export interface ExportOptions {
    ids?: string[];
    feature?: string;
    tags?: string[];
    starred?: boolean;
    output_dir?: string;
    format?: "flat" | "by-feature" | "by-date";
    manifest?: boolean;
}
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
export declare const DEFAULT_CONFIG: ShowcaseConfig;
export interface SimulatorDevice {
    udid: string;
    name: string;
    state: "Booted" | "Shutdown" | "Creating" | string;
    runtime: string;
    platform: "ios" | "watchos";
    isAvailable: boolean;
}
export interface CaptureResult {
    entry: CaptureEntry;
    filePath: string;
    base64?: string;
}
export interface RecordResult {
    entry: CaptureEntry;
    filePath: string;
    thumbnailPath?: string;
}
export type WalkthroughAction = "click" | "type" | "fill" | "hover" | "select" | "navigate" | "screenshot" | "wait" | "scroll";
export interface WalkthroughStep {
    action: WalkthroughAction;
    selector?: string;
    text?: string;
    value?: string;
    url?: string;
    duration?: number;
    y?: number;
    title?: string;
}
export interface StepResult {
    index: number;
    action: WalkthroughAction;
    title: string;
    timestamp_ms: number;
    duration_ms: number;
    screenshotPath?: string;
    screenshotFile?: string;
    error?: string;
}
export interface WalkthroughManifest {
    steps: StepResult[];
    total_duration_ms: number;
    step_count: number;
}
export interface WalkthroughResult {
    entry: CaptureEntry;
    filePath: string;
    thumbnailPath?: string;
    manifest: WalkthroughManifest;
    stepScreenshots: string[];
}
//# sourceMappingURL=types.d.ts.map