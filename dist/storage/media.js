import { mkdirSync, statSync, readFileSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";
import { getStorageDir } from "../config.js";
export function generateId() {
    return "cap_" + randomBytes(6).toString("base64url");
}
export function getMediaDir(cwd) {
    return join(getStorageDir(cwd), "media");
}
export function getCaptureDir(id, cwd) {
    return join(getMediaDir(cwd), id);
}
export function ensureCaptureDir(id, cwd) {
    const dir = getCaptureDir(id, cwd);
    mkdirSync(dir, { recursive: true });
    return dir;
}
export function getFilePath(id, filename, cwd) {
    return join(getCaptureDir(id, cwd), filename);
}
export function getFileSize(filePath) {
    try {
        return statSync(filePath).size;
    }
    catch {
        return 0;
    }
}
export function readFileAsBase64(filePath) {
    return readFileSync(filePath).toString("base64");
}
//# sourceMappingURL=media.js.map