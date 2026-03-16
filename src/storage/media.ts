import { mkdirSync, statSync, readFileSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";
import { getStorageDir } from "../config.js";

export function generateId(): string {
  return "cap_" + randomBytes(6).toString("base64url");
}

export function getMediaDir(cwd?: string): string {
  return join(getStorageDir(cwd), "media");
}

export function getCaptureDir(id: string, cwd?: string): string {
  return join(getMediaDir(cwd), id);
}

export function ensureCaptureDir(id: string, cwd?: string): string {
  const dir = getCaptureDir(id, cwd);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function getFilePath(
  id: string,
  filename: string,
  cwd?: string
): string {
  return join(getCaptureDir(id, cwd), filename);
}

export function getFileSize(filePath: string): number {
  try {
    return statSync(filePath).size;
  } catch {
    return 0;
  }
}

export function readFileAsBase64(filePath: string): string {
  return readFileSync(filePath).toString("base64");
}
