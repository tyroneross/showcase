import type { Viewport, ViewportPreset } from "../types.js";
import { VIEWPORT_PRESETS } from "../types.js";

// Playwright is an optional peer dependency — all types are `any` to avoid
// build failures when it's not installed. Validated at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let playwrightMod: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let browserInstance: any = null;

async function getPlaywright(): Promise<any> {
  if (!playwrightMod) {
    try {
      playwrightMod = await import("playwright");
    } catch {
      throw new Error(
        "Chromium not found. Run: npx playwright install chromium"
      );
    }
  }
  return playwrightMod;
}

async function getBrowser(): Promise<any> {
  if (!browserInstance) {
    const pw = await getPlaywright();
    browserInstance = await pw.chromium.launch({ headless: true });
  }
  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
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

export interface WebScreenshotOptions {
  url: string;
  outputPath: string;
  viewport?: ViewportPreset;
  selector?: string;
  fullPage?: boolean;
  delay?: number;
  disableAnimations?: boolean;
}

export async function webScreenshot(
  options: WebScreenshotOptions
): Promise<{ viewport: Viewport }> {
  const {
    url,
    outputPath,
    viewport: vpPreset = "desktop",
    selector,
    fullPage = false,
    delay = 500,
    disableAnimations = true,
  } = options;

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
    } else {
      await page.screenshot({ path: outputPath, fullPage, type: "png" });
    }

    return { viewport: { ...vp } };
  } finally {
    await context.close();
  }
}

export interface WebRecordOptions {
  url: string;
  outputDir: string;
  viewport?: ViewportPreset;
  duration: number; // seconds
  delay?: number;
  disableAnimations?: boolean;
}

export async function webRecord(
  options: WebRecordOptions
): Promise<{ videoPath: string; viewport: Viewport }> {
  const {
    url,
    outputDir,
    viewport: vpPreset = "desktop",
    duration,
    delay = 500,
    disableAnimations = true,
  } = options;

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
  } finally {
    await context.close();
  }
}
