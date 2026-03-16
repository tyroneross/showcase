import { execFile } from "child_process";
import { promisify } from "util";
import { mkdirSync } from "fs";
import { dirname } from "path";
import type { SimulatorDevice } from "../types.js";

const execFileAsync = promisify(execFile);

// --- Device discovery ---

function parseRuntime(runtime: string): "ios" | "watchos" {
  if (/watchOS/i.test(runtime)) return "watchos";
  return "ios";
}

export async function listDevices(): Promise<SimulatorDevice[]> {
  const { stdout } = await execFileAsync(
    "xcrun",
    ["simctl", "list", "devices", "--json"],
    { timeout: 10000 }
  );
  const data = JSON.parse(stdout);
  const devices: SimulatorDevice[] = [];

  for (const [runtime, deviceList] of Object.entries(data.devices)) {
    if (!Array.isArray(deviceList)) continue;
    for (const dev of deviceList as Array<Record<string, unknown>>) {
      devices.push({
        udid: dev.udid as string,
        name: dev.name as string,
        state: dev.state as SimulatorDevice["state"],
        runtime,
        platform: parseRuntime(runtime),
        isAvailable: dev.isAvailable as boolean,
      });
    }
  }

  return devices;
}

export async function findDevice(
  nameOrUdid: string
): Promise<SimulatorDevice | null> {
  const devices = await listDevices();
  const search = nameOrUdid.toLowerCase();

  // Exact UDID match
  const byUdid = devices.find((d) => d.udid.toLowerCase() === search);
  if (byUdid) return byUdid;

  // Name fragment — prioritize booted, then available
  const matches = devices
    .filter((d) => d.name.toLowerCase().includes(search) && d.isAvailable)
    .sort((a, b) => {
      if (a.state === "Booted" && b.state !== "Booted") return -1;
      if (b.state === "Booted" && a.state !== "Booted") return 1;
      return 0;
    });

  return matches[0] || null;
}

export async function getBootedDevices(): Promise<SimulatorDevice[]> {
  const devices = await listDevices();
  return devices.filter((d) => d.state === "Booted");
}

// --- Screenshot ---

export async function simulatorScreenshot(
  udid: string,
  outputPath: string
): Promise<void> {
  mkdirSync(dirname(outputPath), { recursive: true });
  await execFileAsync(
    "xcrun",
    ["simctl", "io", udid, "screenshot", "--type=png", outputPath],
    { timeout: 15000 }
  );
}

// --- Video recording ---

/**
 * Start recording simulator video. Returns a handle to stop recording.
 * xcrun simctl recordVideo produces h264 MP4 by default.
 * Send SIGINT to stop.
 */
export function startSimulatorRecording(
  udid: string,
  outputPath: string
): { stop: () => Promise<void>; ready: Promise<void> } {
  mkdirSync(dirname(outputPath), { recursive: true });

  const proc = execFile(
    "xcrun",
    ["simctl", "io", udid, "recordVideo", "--codec=h264", outputPath],
    { timeout: 60000 }
  );

  // Wait for "Recording started" on stderr before timing begins
  const ready = new Promise<void>((resolve) => {
    let resolved = false;
    proc.stderr?.on("data", (chunk: Buffer) => {
      if (!resolved && chunk.toString().includes("Recording")) {
        resolved = true;
        resolve();
      }
    });
    // Fallback: resolve after 2s if no stderr message
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    }, 2000);
  });

  return {
    ready,
    stop: () =>
      new Promise<void>((resolve) => {
        proc.on("close", () => resolve());
        proc.kill("SIGINT");
      }),
  };
}
