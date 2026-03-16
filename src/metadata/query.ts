import type { CaptureEntry, FindQuery, GalleryGroupBy } from "../types.js";

export function filterCaptures(
  captures: CaptureEntry[],
  query: FindQuery
): CaptureEntry[] {
  let results = [...captures];

  // AND tags — every tag must be present
  if (query.tags?.length) {
    results = results.filter((c) =>
      query.tags!.every((t) => c.tags.includes(t))
    );
  }

  // OR tags — at least one tag must be present
  if (query.tags_any?.length) {
    results = results.filter((c) =>
      query.tags_any!.some((t) => c.tags.includes(t))
    );
  }

  if (query.feature) {
    const f = query.feature.toLowerCase();
    results = results.filter((c) => c.feature?.toLowerCase() === f);
  }

  if (query.component) {
    const comp = query.component.toLowerCase();
    results = results.filter((c) => c.component?.toLowerCase() === comp);
  }

  if (query.platform) {
    results = results.filter((c) => c.platform === query.platform);
  }

  if (query.type) {
    results = results.filter((c) => c.type === query.type);
  }

  if (query.starred !== undefined) {
    results = results.filter((c) => c.starred === query.starred);
  }

  if (query.since) {
    const sinceMs = parseSince(query.since);
    if (sinceMs) {
      results = results.filter((c) => c.created_at >= sinceMs);
    }
  }

  // Free text search across title, tags, feature, component
  if (query.query) {
    const q = query.query.toLowerCase();
    results = results.filter((c) => {
      const haystack = [
        c.title,
        c.feature,
        c.component,
        ...c.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  // Sort by newest first
  results.sort((a, b) => b.created_at - a.created_at);

  // Limit
  const limit = query.limit ?? 20;
  return results.slice(0, limit);
}

export function groupCaptures(
  captures: CaptureEntry[],
  groupBy: GalleryGroupBy
): Map<string, CaptureEntry[]> {
  const groups = new Map<string, CaptureEntry[]>();

  for (const cap of captures) {
    let key: string;
    switch (groupBy) {
      case "feature":
        key = cap.feature || "(untagged)";
        break;
      case "component":
        key = cap.component || "(untagged)";
        break;
      case "platform":
        key = cap.platform;
        break;
      case "date":
        key = new Date(cap.created_at).toISOString().slice(0, 10);
        break;
    }
    const group = groups.get(key) || [];
    group.push(cap);
    groups.set(key, group);
  }

  return groups;
}

function parseSince(since: string): number | null {
  // Relative: "7d", "24h", "1h", "30m"
  const relMatch = since.match(/^(\d+)([dhm])$/);
  if (relMatch) {
    const val = parseInt(relMatch[1], 10);
    const unit = relMatch[2];
    const ms =
      unit === "d"
        ? val * 86400000
        : unit === "h"
          ? val * 3600000
          : val * 60000;
    return Date.now() - ms;
  }

  // ISO date
  const ts = Date.parse(since);
  return isNaN(ts) ? null : ts;
}
