// --- Capture Index ---
export const VIEWPORT_PRESETS = {
    desktop: { width: 1280, height: 800, name: "desktop" },
    mobile: { width: 390, height: 844, name: "mobile" },
    tablet: { width: 768, height: 1024, name: "tablet" },
};
export const DEFAULT_CONFIG = {
    defaultViewport: "desktop",
    video: { maxDuration: 30, defaultDuration: 5, format: "mp4" },
    capture: { delay: 500, fullPage: false, disableAnimations: true },
    cleanup: { maxCaptures: 500, warnAtMb: 500 },
};
//# sourceMappingURL=types.js.map