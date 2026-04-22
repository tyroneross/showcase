import type { ViewportPreset, RecordResult } from "../types.js";
export interface RecordClipOptions {
    target: string;
    duration?: number;
    viewport?: ViewportPreset;
    tags?: string[];
    title?: string;
    feature?: string;
    component?: string;
}
export declare function recordClip(options: RecordClipOptions): Promise<RecordResult>;
//# sourceMappingURL=recorder.d.ts.map