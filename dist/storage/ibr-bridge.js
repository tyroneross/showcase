import { existsSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
// IBR stores screenshots in .ibr/screenshots/ (current) or .ibr/sessions/ (legacy)
const IBR_PATHS = [".ibr/screenshots", ".ibr/sessions"];
/**
 * Scan IBR directories for screenshot files that could be imported into Showcase.
 * Returns candidates — does NOT auto-import.
 */
export function findIbrCandidates(cwd) {
    const base = cwd || process.cwd();
    const candidates = [];
    for (const relPath of IBR_PATHS) {
        const dir = join(base, relPath);
        if (!existsSync(dir))
            continue;
        try {
            scanDirectory(dir, candidates);
        }
        catch {
            // Permission issues or corrupted dir — skip
        }
    }
    return candidates.sort((a, b) => b.created_at - a.created_at);
}
function scanDirectory(dir, candidates) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            scanDirectory(fullPath, candidates);
            continue;
        }
        const ext = extname(entry.name).toLowerCase();
        if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg")
            continue;
        try {
            const stat = statSync(fullPath);
            candidates.push({
                id: `ibr_${entry.name.replace(ext, "")}`,
                filePath: fullPath,
                created_at: stat.mtimeMs,
                size_bytes: stat.size,
                source: "ibr",
            });
        }
        catch {
            // Skip unreadable files
        }
    }
}
/**
 * Import an IBR screenshot into Showcase by copying the file and creating an index entry.
 * Used by the tag tool when user does: /showcase:tag <ibr-id> +blog
 */
export function ibrCandidateToEntry(candidate, overrides) {
    return {
        created_at: candidate.created_at,
        type: "screenshot",
        format: "png",
        size_bytes: candidate.size_bytes,
        source: "web", // IBR captures are web screenshots
        platform: "web",
        tags: ["imported-from-ibr"],
        starred: false,
        ...overrides,
    };
}
//# sourceMappingURL=ibr-bridge.js.map