import type { Viewport, ViewportPreset, WalkthroughStep, StepResult } from "../types.js";
export declare function closeBrowser(): Promise<void>;
export interface WebScreenshotOptions {
    url: string;
    outputPath: string;
    viewport?: ViewportPreset;
    selector?: string;
    fullPage?: boolean;
    delay?: number;
    disableAnimations?: boolean;
}
export declare function webScreenshot(options: WebScreenshotOptions): Promise<{
    viewport: Viewport;
}>;
export interface WebRecordOptions {
    url: string;
    outputDir: string;
    viewport?: ViewportPreset;
    duration: number;
    delay?: number;
    disableAnimations?: boolean;
}
export declare function webRecord(options: WebRecordOptions): Promise<{
    videoPath: string;
    viewport: Viewport;
}>;
export interface WebWalkthroughOptions {
    url: string;
    captureDir: string;
    steps: WalkthroughStep[];
    viewport?: ViewportPreset;
    stepDelay?: number;
}
export interface WebWalkthroughResult {
    videoPath: string;
    viewport: Viewport;
    stepResults: StepResult[];
    manifestPath: string;
}
export declare function webWalkthrough(options: WebWalkthroughOptions): Promise<WebWalkthroughResult>;
//# sourceMappingURL=web.d.ts.map