import { writeFileSync } from "fs";
import { join } from "path";
import { VIEWPORT_PRESETS } from "../types.js";
import { executeStep, waitForSettle } from "./interact.js";
// Playwright is an optional peer dependency — all types are `any` to avoid
// build failures when it's not installed. Validated at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let playwrightMod = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let browserInstance = null;
async function getPlaywright() {
    if (!playwrightMod) {
        try {
            playwrightMod = await import("playwright");
        }
        catch {
            throw new Error("Chromium not found. Run: npx playwright install chromium");
        }
    }
    return playwrightMod;
}
async function getBrowser() {
    if (!browserInstance) {
        const pw = await getPlaywright();
        browserInstance = await pw.chromium.launch({ headless: true });
    }
    return browserInstance;
}
export async function closeBrowser() {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
}
const DISABLE_ANIMATIONS_CSS = `
*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
  scroll-behavior: auto !important;
}
`;
export async function webScreenshot(options) {
    const { url, outputPath, viewport: vpPreset = "desktop", selector, fullPage = false, delay = 500, disableAnimations = true, } = options;
    const vp = VIEWPORT_PRESETS[vpPreset];
    const browser = await getBrowser();
    const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: "reduce",
    });
    const page = await context.newPage();
    try {
        await page.goto(url, { waitUntil: "load", timeout: 30000 });
        if (delay > 0) {
            await page.waitForTimeout(delay);
        }
        if (disableAnimations) {
            await page.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });
        }
        if (selector) {
            const element = await page.$(selector);
            if (!element) {
                throw new Error(`Selector "${selector}" not found on page`);
            }
            await element.screenshot({ path: outputPath, type: "png" });
        }
        else {
            await page.screenshot({ path: outputPath, fullPage, type: "png" });
        }
        return { viewport: { ...vp } };
    }
    finally {
        await context.close();
    }
}
export async function webRecord(options) {
    const { url, outputDir, viewport: vpPreset = "desktop", duration, delay = 500, disableAnimations = true, } = options;
    const vp = VIEWPORT_PRESETS[vpPreset];
    const browser = await getBrowser();
    const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: "reduce",
        recordVideo: {
            dir: outputDir,
            size: { width: vp.width, height: vp.height },
        },
    });
    const page = await context.newPage();
    try {
        await page.goto(url, { waitUntil: "load", timeout: 30000 });
        if (delay > 0) {
            await page.waitForTimeout(delay);
        }
        if (disableAnimations) {
            await page.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });
        }
        // Record for specified duration
        await page.waitForTimeout(duration * 1000);
        const video = page.video();
        await page.close();
        const videoPath = video ? await video.path() : "";
        return { videoPath, viewport: { ...vp } };
    }
    finally {
        await context.close();
    }
}
export async function webWalkthrough(options) {
    const { url, captureDir, steps, viewport: vpPreset = "desktop", stepDelay = 500, } = options;
    const vp = VIEWPORT_PRESETS[vpPreset];
    const browser = await getBrowser();
    const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: "no-preference", // Keep animations for video
        recordVideo: {
            dir: captureDir,
            size: { width: vp.width, height: vp.height },
        },
    });
    const page = await context.newPage();
    const stepResults = [];
    const startTime = Date.now();
    try {
        // Navigate to target URL
        await page.goto(url, { waitUntil: "load", timeout: 30000 });
        await waitForSettle(page);
        // Execute each step
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const result = await executeStep(page, step, captureDir, i + 1, startTime);
            stepResults.push(result);
            // Pause between steps so video shows distinct states
            if (i < steps.length - 1 && step.action !== "wait") {
                await page.waitForTimeout(stepDelay);
            }
        }
        // Close page to finalize video
        const video = page.video();
        await page.close();
        const videoPath = video ? await video.path() : "";
        // Write walkthrough manifest
        const manifest = {
            steps: stepResults,
            total_duration_ms: Date.now() - startTime,
            step_count: stepResults.length,
        };
        const manifestPath = join(captureDir, "walkthrough.json");
        writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
        return { videoPath, viewport: { ...vp }, stepResults, manifestPath };
    }
    finally {
        await context.close();
    }
}
//# sourceMappingURL=web.js.map