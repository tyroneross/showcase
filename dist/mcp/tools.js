import { execFileSync } from "child_process";
import { loadConfig } from "../config.js";
import { resolveTarget } from "../capture/detect.js";
import { webScreenshot, webWalkthrough } from "../capture/web.js";
import { resolveWindowId, screenCapture } from "../capture/screen.js";
import { findDevice, simulatorScreenshot } from "../capture/simulator.js";
import { recordClip } from "../capture/recorder.js";
import { addCapture, getCapture, updateCapture, deleteCapture, listCaptures, } from "../storage/index.js";
import { generateId, ensureCaptureDir, getFilePath, getFileSize, readFileAsBase64, } from "../storage/media.js";
import { filterCaptures, groupCaptures } from "../metadata/query.js";
import { transcodeToMp4, extractThumbnail, getVideoDuration, isTranscodeNeeded, } from "../capture/transcode.js";
function textResponse(text) {
    return { content: [{ type: "text", text }] };
}
function errorResponse(text) {
    return { content: [{ type: "text", text }], isError: true };
}
function imageResponse(base64, text) {
    return {
        content: [
            { type: "image", data: base64, mimeType: "image/png" },
            { type: "text", text },
        ],
    };
}
// --- Git context ---
function getGitContext() {
    try {
        const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
            timeout: 3000,
            encoding: "utf-8",
        }).trim();
        const commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
            timeout: 3000,
            encoding: "utf-8",
        }).trim();
        return { branch, commit };
    }
    catch {
        return {};
    }
}
// --- Tool definitions ---
export const TOOLS = [
    {
        name: "capture",
        description: "Take a screenshot of a URL, macOS app window, or iOS simulator. Returns the image so Claude can see it, and saves to .showcase/ for later use.",
        inputSchema: {
            type: "object",
            properties: {
                target: {
                    type: "string",
                    description: "What to capture: URL (http://...), app name (e.g. 'Safari'), or simulator (sim:iPhone 16 Pro)",
                },
                viewport: {
                    type: "string",
                    enum: ["desktop", "mobile", "tablet"],
                    description: "Viewport preset for web captures (default: desktop)",
                },
                selector: {
                    type: "string",
                    description: "CSS selector to capture a specific element (web only)",
                },
                full_page: {
                    type: "boolean",
                    description: "Capture full scrollable page (web only, default: false)",
                },
                title: { type: "string", description: "Title for this capture" },
                feature: {
                    type: "string",
                    description: "Feature this capture belongs to",
                },
                component: {
                    type: "string",
                    description: "Component this capture shows",
                },
                tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Tags for this capture",
                },
            },
            required: ["target"],
        },
        annotations: {
            title: "Capture Screenshot",
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: true,
        },
    },
    {
        name: "record",
        description: "Record a short video clip (5-30s) of a URL, macOS app window, or iOS simulator. Saves MP4 to .showcase/.",
        inputSchema: {
            type: "object",
            properties: {
                target: {
                    type: "string",
                    description: "What to record: URL, app name, or simulator (sim:<device>)",
                },
                duration: {
                    type: "number",
                    description: "Duration in seconds (default: 5, max: 30)",
                },
                viewport: {
                    type: "string",
                    enum: ["desktop", "mobile", "tablet"],
                    description: "Viewport preset for web recordings (default: desktop)",
                },
                title: { type: "string", description: "Title for this recording" },
                feature: { type: "string", description: "Feature name" },
                component: { type: "string", description: "Component name" },
                tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Tags",
                },
            },
            required: ["target"],
        },
        annotations: {
            title: "Record Video Clip",
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: true,
        },
    },
    {
        name: "find",
        description: "Search captures by tags, feature, component, platform, type, date, or free text. Returns matching captures with metadata.",
        inputSchema: {
            type: "object",
            properties: {
                tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "All tags must match (AND)",
                },
                tags_any: {
                    type: "array",
                    items: { type: "string" },
                    description: "Any tag matches (OR)",
                },
                feature: { type: "string", description: "Filter by feature" },
                component: { type: "string", description: "Filter by component" },
                platform: {
                    type: "string",
                    enum: ["web", "macos", "ios"],
                    description: "Filter by platform",
                },
                type: {
                    type: "string",
                    enum: ["screenshot", "video"],
                    description: "Filter by type",
                },
                starred: { type: "boolean", description: "Filter starred only" },
                since: {
                    type: "string",
                    description: 'ISO date or relative ("7d", "24h")',
                },
                query: {
                    type: "string",
                    description: "Free text search across title, tags, feature, component",
                },
                limit: {
                    type: "number",
                    description: "Max results (default: 20)",
                },
            },
        },
        annotations: {
            title: "Find Captures",
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    },
    {
        name: "tag",
        description: "Add/remove tags, update title, feature, component, or star a capture.",
        inputSchema: {
            type: "object",
            properties: {
                id: { type: "string", description: "Capture ID" },
                add_tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Tags to add",
                },
                remove_tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Tags to remove",
                },
                title: { type: "string", description: "New title" },
                feature: { type: "string", description: "New feature" },
                component: { type: "string", description: "New component" },
                starred: { type: "boolean", description: "Star/unstar" },
            },
            required: ["id"],
        },
        annotations: {
            title: "Tag Capture",
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    },
    {
        name: "gallery",
        description: "List all captures grouped by feature, date, component, or platform.",
        inputSchema: {
            type: "object",
            properties: {
                group_by: {
                    type: "string",
                    enum: ["feature", "date", "component", "platform"],
                    description: "How to group captures (default: feature)",
                },
            },
        },
        annotations: {
            title: "Gallery",
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    },
    {
        name: "export",
        description: "Copy captures to an output directory with an optional markdown manifest for blog/website use.",
        inputSchema: {
            type: "object",
            properties: {
                ids: {
                    type: "array",
                    items: { type: "string" },
                    description: "Specific capture IDs to export",
                },
                feature: { type: "string", description: "Export all from feature" },
                tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Export all with these tags",
                },
                starred: { type: "boolean", description: "Export starred only" },
                output_dir: {
                    type: "string",
                    description: "Output directory (default: ./showcase-export)",
                },
                format: {
                    type: "string",
                    enum: ["flat", "by-feature", "by-date"],
                    description: "Directory structure (default: flat)",
                },
                manifest: {
                    type: "boolean",
                    description: "Generate markdown manifest (default: true)",
                },
            },
        },
        annotations: {
            title: "Export Captures",
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    },
    {
        name: "status",
        description: "Library stats: total captures, by type, storage size, last capture time.",
        inputSchema: {
            type: "object",
            properties: {},
        },
        annotations: {
            title: "Library Status",
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    },
    {
        name: "delete",
        description: "Remove a capture and its media files.",
        inputSchema: {
            type: "object",
            properties: {
                id: { type: "string", description: "Capture ID to delete" },
            },
            required: ["id"],
        },
        annotations: {
            title: "Delete Capture",
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
    },
    {
        name: "walkthrough",
        description: "Record an interactive walkthrough — scripted clicks, typing, navigation with continuous video capture. Each step produces a screenshot and the full sequence becomes an MP4.",
        inputSchema: {
            type: "object",
            properties: {
                target: {
                    type: "string",
                    description: "URL to start the walkthrough on",
                },
                steps: {
                    type: "array",
                    description: "Sequence of interaction steps",
                    items: {
                        type: "object",
                        properties: {
                            action: {
                                type: "string",
                                enum: [
                                    "click",
                                    "type",
                                    "fill",
                                    "hover",
                                    "select",
                                    "navigate",
                                    "screenshot",
                                    "wait",
                                    "scroll",
                                ],
                                description: "Action to perform",
                            },
                            selector: {
                                type: "string",
                                description: "CSS selector for the target element (click, type, fill, hover, select, scroll)",
                            },
                            text: {
                                type: "string",
                                description: "Text to type or fill",
                            },
                            value: {
                                type: "string",
                                description: "Value to select (select action)",
                            },
                            url: {
                                type: "string",
                                description: "URL to navigate to (navigate action)",
                            },
                            duration: {
                                type: "number",
                                description: "Milliseconds to wait (wait action)",
                            },
                            y: {
                                type: "number",
                                description: "Pixel Y position to scroll to (scroll action)",
                            },
                            title: {
                                type: "string",
                                description: "Human-readable title for this step",
                            },
                        },
                        required: ["action"],
                    },
                },
                viewport: {
                    type: "string",
                    enum: ["desktop", "mobile", "tablet"],
                    description: "Viewport preset (default: desktop)",
                },
                step_delay: {
                    type: "number",
                    description: "Milliseconds between steps (default: 500)",
                },
                title: { type: "string", description: "Title for this walkthrough" },
                feature: {
                    type: "string",
                    description: "Feature this walkthrough belongs to",
                },
                component: {
                    type: "string",
                    description: "Component this walkthrough demonstrates",
                },
                tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Tags for this walkthrough",
                },
            },
            required: ["target", "steps"],
        },
        annotations: {
            title: "Interactive Walkthrough",
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: true,
        },
    },
];
// --- Tool handler dispatch ---
export async function handleToolCall(name, args) {
    try {
        switch (name) {
            case "capture":
                return await handleCapture(args);
            case "record":
                return await handleRecord(args);
            case "find":
                return handleFind(args);
            case "tag":
                return handleTag(args);
            case "gallery":
                return handleGallery(args);
            case "export":
                return await handleExport(args);
            case "status":
                return handleStatus();
            case "delete":
                return handleDelete(args);
            case "walkthrough":
                return await handleWalkthrough(args);
            default:
                return errorResponse(`Unknown tool: ${name}`);
        }
    }
    catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Tool execution failed");
    }
}
// --- Handlers ---
async function handleCapture(args) {
    const target = args.target;
    if (!target)
        return errorResponse("target is required");
    const config = loadConfig();
    const resolved = resolveTarget(target);
    const id = generateId();
    const dir = ensureCaptureDir(id);
    const outputPath = getFilePath(id, "original.png");
    const git = getGitContext();
    let viewport = {
        width: 1280,
        height: 800,
        name: "desktop",
    };
    switch (resolved.source) {
        case "web": {
            const result = await webScreenshot({
                url: resolved.url,
                outputPath,
                viewport: args.viewport || config.defaultViewport,
                selector: args.selector,
                fullPage: args.full_page ?? config.capture.fullPage,
                delay: config.capture.delay,
                disableAnimations: config.capture.disableAnimations,
            });
            viewport = result.viewport;
            break;
        }
        case "screen": {
            const windowId = await resolveWindowId(resolved.appName);
            await screenCapture(windowId, outputPath);
            break;
        }
        case "simulator": {
            const device = await findDevice(resolved.deviceName);
            if (!device) {
                return errorResponse(`No simulator found for '${resolved.deviceName}'. Run: xcrun simctl list devices`);
            }
            if (device.state !== "Booted") {
                return errorResponse(`Simulator '${device.name}' is not booted. Boot with: xcrun simctl boot "${device.udid}"`);
            }
            resolved.deviceUdid = device.udid;
            await simulatorScreenshot(device.udid, outputPath);
            viewport = { width: 0, height: 0 }; // Determined by device
            break;
        }
    }
    const entry = {
        id,
        created_at: Date.now(),
        type: "screenshot",
        format: "png",
        size_bytes: getFileSize(outputPath),
        source: resolved.source,
        platform: resolved.platform,
        url: resolved.url,
        viewport,
        selector: args.selector,
        device_name: resolved.deviceName,
        title: args.title,
        feature: args.feature,
        component: args.component,
        tags: args.tags || [],
        starred: false,
        git_branch: git.branch,
        git_commit: git.commit,
    };
    addCapture(entry);
    const base64 = readFileAsBase64(outputPath);
    const meta = [
        `Saved: ${id}`,
        entry.title ? `Title: ${entry.title}` : null,
        `Source: ${entry.source} (${entry.platform})`,
        `Viewport: ${viewport.width}x${viewport.height}`,
        `Size: ${formatBytes(entry.size_bytes)}`,
        entry.tags.length ? `Tags: ${entry.tags.join(", ")}` : null,
    ]
        .filter(Boolean)
        .join("\n");
    return imageResponse(base64, meta);
}
async function handleRecord(args) {
    const target = args.target;
    if (!target)
        return errorResponse("target is required");
    const config = loadConfig();
    const duration = args.duration;
    if (duration !== undefined && duration > config.video.maxDuration) {
        return errorResponse(`Duration ${duration}s exceeds max of ${config.video.maxDuration}s`);
    }
    const result = await recordClip({
        target,
        duration,
        viewport: args.viewport,
        tags: args.tags,
        title: args.title,
        feature: args.feature,
        component: args.component,
    });
    const meta = [
        `Recorded: ${result.entry.id}`,
        result.entry.title ? `Title: ${result.entry.title}` : null,
        `Source: ${result.entry.source} (${result.entry.platform})`,
        `Duration: ${((result.entry.duration_ms || 0) / 1000).toFixed(1)}s`,
        `Size: ${formatBytes(result.entry.size_bytes)}`,
        `File: ${result.filePath}`,
        result.entry.tags.length
            ? `Tags: ${result.entry.tags.join(", ")}`
            : null,
    ]
        .filter(Boolean)
        .join("\n");
    return textResponse(meta);
}
function handleFind(args) {
    const captures = listCaptures();
    const query = {
        tags: args.tags,
        tags_any: args.tags_any,
        feature: args.feature,
        component: args.component,
        platform: args.platform,
        type: args.type,
        starred: args.starred,
        since: args.since,
        query: args.query,
        limit: args.limit,
    };
    const results = filterCaptures(captures, query);
    if (results.length === 0) {
        return textResponse("No captures found matching your query.");
    }
    const lines = [`Found ${results.length} capture(s):\n`];
    for (const cap of results) {
        const date = new Date(cap.created_at).toISOString().slice(0, 16);
        const star = cap.starred ? " *" : "";
        const tags = cap.tags.length ? ` [${cap.tags.join(", ")}]` : "";
        lines.push(`- ${cap.id}${star} | ${cap.type} | ${cap.platform} | ${date}${tags}`);
        if (cap.title)
            lines.push(`  ${cap.title}`);
        if (cap.feature || cap.component) {
            lines.push(`  ${[cap.feature, cap.component].filter(Boolean).join(" / ")}`);
        }
        if (cap.walkthrough) {
            lines.push(`  Walkthrough: ${cap.walkthrough.step_count} steps`);
        }
    }
    return textResponse(lines.join("\n"));
}
function handleTag(args) {
    const id = args.id;
    if (!id)
        return errorResponse("id is required");
    const entry = getCapture(id);
    if (!entry)
        return errorResponse(`Capture not found: ${id}`);
    const updates = {};
    if (args.add_tags) {
        const newTags = new Set([...entry.tags, ...args.add_tags]);
        updates.tags = [...newTags];
    }
    if (args.remove_tags) {
        const removals = new Set(args.remove_tags);
        updates.tags = (updates.tags || entry.tags).filter((t) => !removals.has(t));
    }
    if (args.title !== undefined)
        updates.title = args.title;
    if (args.feature !== undefined)
        updates.feature = args.feature;
    if (args.component !== undefined)
        updates.component = args.component;
    if (args.starred !== undefined)
        updates.starred = args.starred;
    const updated = updateCapture(id, updates);
    if (!updated)
        return errorResponse(`Failed to update: ${id}`);
    const lines = [`Updated ${id}:`];
    if (updates.tags)
        lines.push(`Tags: ${updated.tags.join(", ") || "(none)"}`);
    if (updates.title !== undefined)
        lines.push(`Title: ${updated.title}`);
    if (updates.feature !== undefined)
        lines.push(`Feature: ${updated.feature}`);
    if (updates.component !== undefined)
        lines.push(`Component: ${updated.component}`);
    if (updates.starred !== undefined)
        lines.push(`Starred: ${updated.starred ? "yes" : "no"}`);
    return textResponse(lines.join("\n"));
}
function handleGallery(args) {
    const captures = listCaptures();
    if (captures.length === 0) {
        return textResponse("No captures yet. Use 'capture' to take screenshots.");
    }
    const groupBy = args.group_by || "feature";
    const groups = groupCaptures(captures, groupBy);
    const lines = [`Gallery (${captures.length} captures, grouped by ${groupBy}):\n`];
    for (const [key, items] of groups) {
        lines.push(`## ${key} (${items.length})`);
        for (const cap of items) {
            const date = new Date(cap.created_at).toISOString().slice(0, 16);
            const star = cap.starred ? " *" : "";
            lines.push(`  - ${cap.id}${star} | ${cap.type} | ${date}`);
            if (cap.title)
                lines.push(`    ${cap.title}`);
        }
        lines.push("");
    }
    return textResponse(lines.join("\n"));
}
async function handleExport(args) {
    // Phase 6 — full export implementation
    const { mkdirSync, copyFileSync, writeFileSync, existsSync } = await import("fs");
    const { join, basename } = await import("path");
    const captures = listCaptures();
    let toExport;
    if (args.ids) {
        const ids = new Set(args.ids);
        toExport = captures.filter((c) => ids.has(c.id));
    }
    else {
        const query = {
            feature: args.feature,
            tags: args.tags,
            starred: args.starred,
            limit: 1000,
        };
        toExport = filterCaptures(captures, query);
    }
    if (toExport.length === 0) {
        return errorResponse("No captures matched for export.");
    }
    const outputDir = args.output_dir || "./showcase-export";
    const format = args.format || "flat";
    const manifest = args.manifest ?? true;
    mkdirSync(outputDir, { recursive: true });
    const manifestLines = ["# Showcase Export\n"];
    let exported = 0;
    for (const cap of toExport) {
        const ext = cap.format;
        const srcFile = getFilePath(cap.id, `original.${ext}`);
        if (!existsSync(srcFile))
            continue;
        let destDir = outputDir;
        if (format === "by-feature" && cap.feature) {
            destDir = join(outputDir, cap.feature);
        }
        else if (format === "by-date") {
            destDir = join(outputDir, new Date(cap.created_at).toISOString().slice(0, 10));
        }
        mkdirSync(destDir, { recursive: true });
        const destName = `${cap.id}.${ext}`;
        const destPath = join(destDir, destName);
        copyFileSync(srcFile, destPath);
        exported++;
        // Export walkthrough assets (step screenshots + manifest)
        if (cap.walkthrough) {
            const walkthroughManifest = getFilePath(cap.id, "walkthrough.json");
            if (existsSync(walkthroughManifest)) {
                copyFileSync(walkthroughManifest, join(destDir, `${cap.id}_walkthrough.json`));
            }
            // Copy step screenshots
            const { readdirSync } = await import("fs");
            const capDir = getFilePath(cap.id, "").replace(/\/$/, "");
            try {
                for (const file of readdirSync(capDir)) {
                    if (file.startsWith("step_") && file.endsWith(".png")) {
                        copyFileSync(join(capDir, file), join(destDir, `${cap.id}_${file}`));
                    }
                }
            }
            catch {
                // Step screenshots are optional
            }
        }
        if (manifest) {
            const date = new Date(cap.created_at).toISOString().slice(0, 16);
            manifestLines.push(`## ${cap.title || cap.id}`);
            manifestLines.push(`- **ID:** ${cap.id}`);
            manifestLines.push(`- **Type:** ${cap.type} (${cap.platform})`);
            manifestLines.push(`- **Date:** ${date}`);
            if (cap.feature)
                manifestLines.push(`- **Feature:** ${cap.feature}`);
            if (cap.component)
                manifestLines.push(`- **Component:** ${cap.component}`);
            if (cap.tags.length)
                manifestLines.push(`- **Tags:** ${cap.tags.join(", ")}`);
            if (cap.walkthrough)
                manifestLines.push(`- **Steps:** ${cap.walkthrough.step_count} (${cap.walkthrough.steps.join(", ")})`);
            manifestLines.push(`- **File:** ${destName}`);
            manifestLines.push(`\n![${cap.title || cap.id}](./${destName})\n`);
        }
    }
    if (manifest) {
        writeFileSync(join(outputDir, "manifest.md"), manifestLines.join("\n") + "\n");
    }
    return textResponse(`Exported ${exported} capture(s) to ${outputDir}${manifest ? " with manifest.md" : ""}`);
}
function handleStatus() {
    const captures = listCaptures();
    const screenshots = captures.filter((c) => c.type === "screenshot").length;
    const videos = captures.filter((c) => c.type === "video").length;
    const starred = captures.filter((c) => c.starred).length;
    const totalBytes = captures.reduce((sum, c) => sum + c.size_bytes, 0);
    const features = new Set(captures.map((c) => c.feature).filter(Boolean)).size;
    const platforms = new Set(captures.map((c) => c.platform));
    const lines = [
        `Showcase Library`,
        ``,
        `Total: ${captures.length} captures`,
        `  Screenshots: ${screenshots}`,
        `  Videos: ${videos}`,
        `  Starred: ${starred}`,
        ``,
        `Storage: ${formatBytes(totalBytes)}`,
        `Features: ${features}`,
        `Platforms: ${[...platforms].join(", ") || "none"}`,
    ];
    if (captures.length > 0) {
        const latest = captures.reduce((a, b) => a.created_at > b.created_at ? a : b);
        const age = Date.now() - latest.created_at;
        const ageStr = age < 60000
            ? "< 1 min ago"
            : age < 3600000
                ? `${Math.round(age / 60000)} min ago`
                : `${Math.round(age / 3600000)} hours ago`;
        lines.push(`Last capture: ${ageStr} (${latest.id})`);
    }
    return textResponse(lines.join("\n"));
}
async function handleWalkthrough(args) {
    const target = args.target;
    if (!target)
        return errorResponse("target is required");
    const steps = args.steps;
    if (!steps?.length)
        return errorResponse("steps array is required and must not be empty");
    const id = generateId();
    const dir = ensureCaptureDir(id);
    const finalPath = getFilePath(id, "original.mp4");
    const thumbPath = getFilePath(id, "thumb.png");
    const git = getGitContext();
    const result = await webWalkthrough({
        url: target,
        captureDir: dir,
        steps,
        viewport: args.viewport || "desktop",
        stepDelay: args.step_delay || 500,
    });
    // Transcode WebM → MP4
    if (result.videoPath && isTranscodeNeeded(result.videoPath)) {
        await transcodeToMp4(result.videoPath, finalPath);
    }
    else if (result.videoPath && result.videoPath !== finalPath) {
        const { renameSync } = await import("fs");
        renameSync(result.videoPath, finalPath);
    }
    // Generate thumbnail
    let thumbnailPath;
    const { existsSync } = await import("fs");
    if (existsSync(finalPath)) {
        try {
            await extractThumbnail(finalPath, thumbPath);
            thumbnailPath = thumbPath;
        }
        catch {
            // Thumbnail is optional
        }
    }
    const durationMs = existsSync(finalPath)
        ? await getVideoDuration(finalPath)
        : result.stepResults[result.stepResults.length - 1]?.timestamp_ms || 0;
    const stepTitles = result.stepResults
        .map((s) => s.title)
        .filter(Boolean);
    const entry = {
        id,
        created_at: Date.now(),
        type: "video",
        format: "mp4",
        size_bytes: getFileSize(finalPath),
        duration_ms: durationMs,
        source: "web",
        platform: "web",
        url: target,
        viewport: result.viewport,
        title: args.title,
        feature: args.feature,
        component: args.component,
        tags: args.tags || [],
        starred: false,
        walkthrough: {
            step_count: result.stepResults.length,
            steps: stepTitles,
        },
        git_branch: git.branch,
        git_commit: git.commit,
    };
    addCapture(entry);
    // Build response
    const errors = result.stepResults.filter((s) => s.error);
    const lines = [
        `Walkthrough recorded: ${id}`,
        entry.title ? `Title: ${entry.title}` : null,
        `Steps: ${result.stepResults.length} (${errors.length} errors)`,
        `Duration: ${(durationMs / 1000).toFixed(1)}s`,
        `Size: ${formatBytes(entry.size_bytes)}`,
        `Video: ${finalPath}`,
        thumbnailPath ? `Thumbnail: ${thumbnailPath}` : null,
        `Manifest: ${result.manifestPath}`,
        entry.tags.length ? `Tags: ${entry.tags.join(", ")}` : null,
        ``,
        `Step results:`,
    ];
    for (const step of result.stepResults) {
        const status = step.error ? `ERROR: ${step.error}` : "OK";
        const screenshot = step.screenshotFile ? ` [${step.screenshotFile}]` : "";
        lines.push(`  ${step.index}. ${step.action}: ${step.title} — ${status}${screenshot} (${step.duration_ms}ms)`);
    }
    return textResponse(lines.filter((l) => l !== null).join("\n"));
}
function handleDelete(args) {
    const id = args.id;
    if (!id)
        return errorResponse("id is required");
    const entry = getCapture(id);
    if (!entry)
        return errorResponse(`Capture not found: ${id}`);
    const deleted = deleteCapture(id);
    return deleted
        ? textResponse(`Deleted ${id} (${entry.type}, ${formatBytes(entry.size_bytes)})`)
        : errorResponse(`Failed to delete ${id}`);
}
// --- Helpers ---
function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1048576)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}
//# sourceMappingURL=tools.js.map