// Public API barrel export

// Types
export type {
  ShowcaseIndex,
  CaptureEntry,
  Viewport,
  CaptureSource,
  CaptureTarget,
  ViewportPreset,
  CaptureOptions,
  RecordOptions,
  FindQuery,
  GalleryGroupBy,
  ExportOptions,
  ShowcaseConfig,
  SimulatorDevice,
  CaptureResult,
  RecordResult,
} from "./types.js";

export { VIEWPORT_PRESETS, DEFAULT_CONFIG } from "./types.js";

// Config
export { loadConfig, getStorageDir } from "./config.js";

// Storage
export {
  loadIndex,
  addCapture,
  getCapture,
  updateCapture,
  deleteCapture,
  listCaptures,
} from "./storage/index.js";

export {
  generateId,
  getMediaDir,
  getCaptureDir,
  ensureCaptureDir,
  getFilePath,
  getFileSize,
  readFileAsBase64,
} from "./storage/media.js";

// Metadata
export { filterCaptures, groupCaptures } from "./metadata/query.js";

// Capture
export { resolveTarget } from "./capture/detect.js";
export { webScreenshot, closeBrowser } from "./capture/web.js";
export { resolveWindowId, screenCapture } from "./capture/screen.js";
export {
  listDevices,
  findDevice,
  getBootedDevices,
  simulatorScreenshot,
} from "./capture/simulator.js";
export { recordClip } from "./capture/recorder.js";
export {
  transcodeToMp4,
  extractThumbnail,
  getVideoDuration,
} from "./capture/transcode.js";

// IBR Bridge
export { findIbrCandidates, ibrCandidateToEntry } from "./storage/ibr-bridge.js";
