import type { WalkthroughStep, StepResult } from "../types.js";
type Page = any;
/**
 * Wait for network idle + DOM stability after an action.
 * - No pending network requests for 300ms
 * - No DOM mutations for 300ms
 */
export declare function waitForSettle(page: Page, timeout?: number): Promise<void>;
/**
 * Execute a single walkthrough step on the page.
 * Returns a StepResult with timing and optional screenshot path.
 */
export declare function executeStep(page: Page, step: WalkthroughStep, captureDir: string, index: number, startTime: number): Promise<StepResult>;
export {};
//# sourceMappingURL=interact.d.ts.map