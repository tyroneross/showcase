import type { CaptureEntry } from "../types.js";
interface IbrCandidate {
    id: string;
    filePath: string;
    created_at: number;
    size_bytes: number;
    source: "ibr";
}
/**
 * Scan IBR directories for screenshot files that could be imported into Showcase.
 * Returns candidates — does NOT auto-import.
 */
export declare function findIbrCandidates(cwd?: string): IbrCandidate[];
/**
 * Import an IBR screenshot into Showcase by copying the file and creating an index entry.
 * Used by the tag tool when user does: /showcase:tag <ibr-id> +blog
 */
export declare function ibrCandidateToEntry(candidate: IbrCandidate, overrides?: Partial<CaptureEntry>): Omit<CaptureEntry, "id">;
export {};
//# sourceMappingURL=ibr-bridge.d.ts.map