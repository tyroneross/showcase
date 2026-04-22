import type { ShowcaseIndex, CaptureEntry } from "../types.js";
export declare function loadIndex(cwd?: string): ShowcaseIndex;
export declare function saveIndex(index: ShowcaseIndex, cwd?: string): void;
export declare function addCapture(entry: CaptureEntry, cwd?: string): void;
export declare function getCapture(id: string, cwd?: string): CaptureEntry | undefined;
export declare function updateCapture(id: string, updates: Partial<CaptureEntry>, cwd?: string): CaptureEntry | undefined;
export declare function deleteCapture(id: string, cwd?: string): boolean;
export declare function listCaptures(cwd?: string): CaptureEntry[];
//# sourceMappingURL=index.d.ts.map