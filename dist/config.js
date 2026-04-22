import { readFileSync } from "fs";
import { join } from "path";
import { DEFAULT_CONFIG } from "./types.js";
const STORAGE_DIR = ".showcase";
const CONFIG_FILE = ".showcaserc.json";
export function getStorageDir(cwd) {
    return join(cwd || process.cwd(), STORAGE_DIR);
}
export function loadConfig(cwd) {
    const base = cwd || process.cwd();
    // Try .showcaserc.json in project root
    try {
        const raw = readFileSync(join(base, CONFIG_FILE), "utf-8");
        const user = JSON.parse(raw);
        return mergeConfig(user);
    }
    catch {
        // No config file — use defaults
    }
    // Try .showcase/config.json
    try {
        const raw = readFileSync(join(base, STORAGE_DIR, "config.json"), "utf-8");
        const user = JSON.parse(raw);
        return mergeConfig(user);
    }
    catch {
        // No config file — use defaults
    }
    return { ...DEFAULT_CONFIG };
}
function mergeConfig(user) {
    return {
        baseUrl: user.baseUrl ?? DEFAULT_CONFIG.baseUrl,
        defaultViewport: user.defaultViewport ?? DEFAULT_CONFIG.defaultViewport,
        video: { ...DEFAULT_CONFIG.video, ...user.video },
        capture: { ...DEFAULT_CONFIG.capture, ...user.capture },
        cleanup: { ...DEFAULT_CONFIG.cleanup, ...user.cleanup },
    };
}
//# sourceMappingURL=config.js.map