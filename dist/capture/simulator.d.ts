import type { SimulatorDevice } from "../types.js";
export declare function listDevices(): Promise<SimulatorDevice[]>;
export declare function findDevice(nameOrUdid: string): Promise<SimulatorDevice | null>;
export declare function getBootedDevices(): Promise<SimulatorDevice[]>;
export declare function simulatorScreenshot(udid: string, outputPath: string): Promise<void>;
/**
 * Start recording simulator video. Returns a handle to stop recording.
 * xcrun simctl recordVideo produces h264 MP4 by default.
 * Send SIGINT to stop.
 */
export declare function startSimulatorRecording(udid: string, outputPath: string): {
    stop: () => Promise<void>;
    ready: Promise<void>;
};
//# sourceMappingURL=simulator.d.ts.map