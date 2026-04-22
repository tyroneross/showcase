import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { getStorageDir } from "../config.js";
import { getCaptureDir } from "./media.js";
function getIndexPath(cwd) {
    return join(getStorageDir(cwd), "index.json");
}
function emptyIndex() {
    return { version: "1", captures: [] };
}
export function loadIndex(cwd) {
    try {
        const raw = readFileSync(getIndexPath(cwd), "utf-8");
        return JSON.parse(raw);
    }
    catch {
        return emptyIndex();
    }
}
export function saveIndex(index, cwd) {
    const dir = getStorageDir(cwd);
    mkdirSync(dir, { recursive: true });
    writeFileSync(getIndexPath(cwd), JSON.stringify(index, null, 2) + "\n");
}
export function addCapture(entry, cwd) {
    const index = loadIndex(cwd);
    index.captures.push(entry);
    saveIndex(index, cwd);
}
export function getCapture(id, cwd) {
    const index = loadIndex(cwd);
    return index.captures.find((c) => c.id === id);
}
export function updateCapture(id, updates, cwd) {
    const index = loadIndex(cwd);
    const entry = index.captures.find((c) => c.id === id);
    if (!entry)
        return undefined;
    Object.assign(entry, updates);
    saveIndex(index, cwd);
    return entry;
}
export function deleteCapture(id, cwd) {
    const index = loadIndex(cwd);
    const before = index.captures.length;
    index.captures = index.captures.filter((c) => c.id !== id);
    if (index.captures.length === before)
        return false;
    saveIndex(index, cwd);
    // Remove media directory
    const mediaDir = getCaptureDir(id, cwd);
    if (existsSync(mediaDir)) {
        rmSync(mediaDir, { recursive: true, force: true });
    }
    return true;
}
export function listCaptures(cwd) {
    return loadIndex(cwd).captures;
}
//# sourceMappingURL=index.js.map