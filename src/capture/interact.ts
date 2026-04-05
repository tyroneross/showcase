import type { WalkthroughStep, WalkthroughAction, StepResult } from "../types.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Page = any;

/**
 * Wait for network idle + DOM stability after an action.
 * - No pending network requests for 300ms
 * - No DOM mutations for 300ms
 */
export async function waitForSettle(page: Page, timeout = 5000): Promise<void> {
  try {
    await page.waitForLoadState("networkidle", { timeout });
  } catch {
    // Network idle timeout is non-fatal — page may have long-polling
  }

  // Wait for DOM mutations to stop (300ms quiet period)
  // The callback runs in browser context — suppress TS DOM type errors
  await page.evaluate(`() => {
    return new Promise((resolve) => {
      let timer;
      const observer = new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(() => { observer.disconnect(); resolve(); }, 300);
      });
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });
      timer = setTimeout(() => { observer.disconnect(); resolve(); }, 300);
    });
  }`);
}

/**
 * Execute a single walkthrough step on the page.
 * Returns a StepResult with timing and optional screenshot path.
 */
export async function executeStep(
  page: Page,
  step: WalkthroughStep,
  captureDir: string,
  index: number,
  startTime: number
): Promise<StepResult> {
  const stepStart = Date.now();
  const timestamp_ms = stepStart - startTime;
  const title = step.title || `Step ${index}`;
  const { join } = await import("path");

  const result: StepResult = {
    index,
    action: step.action,
    title,
    timestamp_ms,
    duration_ms: 0,
  };

  try {
    switch (step.action) {
      case "click": {
        assertSelector(step);
        await page.click(step.selector!, { timeout: 10000 });
        await waitForSettle(page);
        break;
      }

      case "type": {
        assertSelector(step);
        await page.click(step.selector!, { timeout: 10000 });
        // Type character by character so it's visible in video
        await page.type(step.selector!, step.text || "", { delay: 50 });
        await waitForSettle(page);
        break;
      }

      case "fill": {
        assertSelector(step);
        await page.fill(step.selector!, step.text || "");
        await waitForSettle(page);
        break;
      }

      case "hover": {
        assertSelector(step);
        await page.hover(step.selector!, { timeout: 10000 });
        // Brief pause to let tooltips/dropdowns appear
        await page.waitForTimeout(500);
        break;
      }

      case "select": {
        assertSelector(step);
        await page.selectOption(step.selector!, step.value || "");
        await waitForSettle(page);
        break;
      }

      case "navigate": {
        const url = step.url;
        if (!url) throw new Error("navigate step requires 'url'");
        await page.goto(url, { waitUntil: "load", timeout: 30000 });
        await waitForSettle(page);
        break;
      }

      case "wait": {
        const duration = step.duration || 1000;
        await page.waitForTimeout(duration);
        break;
      }

      case "scroll": {
        if (step.selector) {
          await page.locator(step.selector).scrollIntoViewIfNeeded({ timeout: 10000 });
        } else if (step.y !== undefined) {
          await page.evaluate(`(y) => window.scrollTo({ top: y, behavior: "smooth" })`, step.y);
        }
        await page.waitForTimeout(500); // Let scroll animation complete
        break;
      }

      case "screenshot": {
        // No page action — just capture below
        break;
      }
    }

    // Capture screenshot for state-changing actions + explicit screenshot steps
    if (shouldScreenshot(step.action)) {
      const slug = slugify(title);
      const filename = `step_${String(index).padStart(2, "0")}_${slug}.png`;
      const screenshotPath = join(captureDir, filename);
      await page.screenshot({ path: screenshotPath, type: "png" });
      result.screenshotPath = screenshotPath;
      result.screenshotFile = filename;
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
  }

  result.duration_ms = Date.now() - stepStart;
  return result;
}

function assertSelector(step: WalkthroughStep): void {
  if (!step.selector) {
    throw new Error(`${step.action} step requires 'selector'`);
  }
}

function shouldScreenshot(action: WalkthroughAction): boolean {
  return action !== "wait";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}
