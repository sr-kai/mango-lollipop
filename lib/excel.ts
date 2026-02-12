// =============================================================================
// Mango Lollipop — Excel Generation (SheetJS / xlsx)
// =============================================================================

import * as XLSX from "xlsx";
import { writeFileSync } from "fs";
import type {
  Message,
  EventTaxonomy,
  Channel,
  AARRRStage,
} from "./schema.js";

// -----------------------------------------------------------------------------
// Stage display names
// -----------------------------------------------------------------------------

const STAGE_LABELS: Record<AARRRStage | "TX", string> = {
  TX: "Transactional",
  AQ: "Acquisition",
  AC: "Activation",
  RV: "Revenue",
  RT: "Retention",
  RF: "Referral",
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function guardsToString(msg: Message): string {
  if (!msg.guards.length) return "\u2014";
  return msg.guards.map((g) => g.condition).join("; ");
}

function suppressionsToString(msg: Message): string {
  if (!msg.suppressions.length) return "\u2014";
  return msg.suppressions.map((s) => s.condition).join("; ");
}

function channelsToString(channels: Channel[]): string {
  return channels.join(", ");
}

function tagsToString(tags: string[]): string {
  return tags.join(", ");
}

// -----------------------------------------------------------------------------
// Sheet builders
// -----------------------------------------------------------------------------

function buildTransactionalSheet(messages: Message[]): XLSX.WorkSheet {
  const tx = messages.filter((m) => m.classification === "transactional");
  const rows = tx.map((m) => ({
    ID: m.id,
    Name: m.name,
    "Trigger Event": m.trigger.event,
    "Trigger Type": m.trigger.type,
    Wait: m.wait,
    Channels: channelsToString(m.channels),
    CTA: m.cta.text,
    From: m.from,
    Tags: tagsToString(m.tags),
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  autoFitColumns(ws, rows);
  return ws;
}

function buildLifecycleSheet(messages: Message[]): XLSX.WorkSheet {
  const lc = messages.filter((m) => m.classification === "lifecycle");
  const rows = lc.map((m) => ({
    ID: m.id,
    Stage: STAGE_LABELS[m.stage] ?? m.stage,
    Name: m.name,
    "Trigger Event": m.trigger.event,
    "Trigger Type": m.trigger.type,
    Wait: m.wait,
    Guards: guardsToString(m),
    Suppressions: suppressionsToString(m),
    Channels: channelsToString(m.channels),
    CTA: m.cta.text,
    Goal: m.goal,
    Segment: m.segment,
    Tags: tagsToString(m.tags),
    Format: m.format,
    From: m.from,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  autoFitColumns(ws, rows);
  return ws;
}

function buildEventTaxonomySheet(
  events: EventTaxonomy,
  messages: Message[]
): XLSX.WorkSheet {
  const rows: { Category: string; Event: string; "Used By": string }[] = [];

  const categories: (keyof EventTaxonomy)[] = [
    "identity",
    "activation",
    "engagement",
    "conversion",
    "retention",
  ];

  for (const category of categories) {
    const eventList = events[category] ?? [];
    for (const event of eventList) {
      const usedBy = messages
        .filter((m) => m.trigger.event === event)
        .map((m) => m.id)
        .join(", ");
      rows.push({
        Category: category.charAt(0).toUpperCase() + category.slice(1),
        Event: event,
        "Used By": usedBy || "\u2014",
      });
    }
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  autoFitColumns(ws, rows);
  return ws;
}

function buildTagsSheet(
  messages: Message[],
  tagDefinitions: string[]
): XLSX.WorkSheet {
  // Collect all unique tags from messages and definitions
  const allTags = new Set<string>([
    ...tagDefinitions,
    ...messages.flatMap((m) => m.tags),
  ]);

  const rows = Array.from(allTags)
    .sort()
    .map((tag) => {
      const msgIds = messages
        .filter((m) => m.tags.includes(tag))
        .map((m) => m.id);
      return {
        Tag: tag,
        "Message Count": msgIds.length,
        "Used By": msgIds.join(", ") || "\u2014",
      };
    });

  const ws = XLSX.utils.json_to_sheet(rows);
  autoFitColumns(ws, rows);
  return ws;
}

function buildChannelStrategySheet(messages: Message[]): XLSX.WorkSheet {
  const channels: Channel[] = ["email", "sms", "in-app", "push"];
  const stages: (AARRRStage | "TX")[] = ["TX", "AQ", "AC", "RV", "RT", "RF"];

  const rows: Record<string, string | number>[] = [];

  for (const channel of channels) {
    const msgsWithChannel = messages.filter((m) =>
      m.channels.includes(channel)
    );
    if (msgsWithChannel.length === 0) continue;

    const row: Record<string, string | number> = {
      Channel: channel,
      "Total Messages": msgsWithChannel.length,
    };

    for (const stage of stages) {
      const count = msgsWithChannel.filter((m) => m.stage === stage).length;
      row[STAGE_LABELS[stage]] = count;
    }

    rows.push(row);
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  autoFitColumns(ws, rows);
  return ws;
}

// Auto-fit column widths based on content
function autoFitColumns(
  ws: XLSX.WorkSheet,
  rows: Record<string, unknown>[]
): void {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  ws["!cols"] = headers.map((h) => {
    let maxWidth = h.length;
    for (const row of rows) {
      const val = String(row[h] ?? "");
      if (val.length > maxWidth) maxWidth = val.length;
    }
    return { wch: Math.min(maxWidth + 2, 60) };
  });
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export function generateMatrixWorkbook(
  messages: Message[],
  events: EventTaxonomy,
  tags: string[]
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    buildTransactionalSheet(messages),
    "Transactional Messages"
  );
  XLSX.utils.book_append_sheet(
    wb,
    buildLifecycleSheet(messages),
    "Lifecycle Matrix"
  );
  XLSX.utils.book_append_sheet(
    wb,
    buildEventTaxonomySheet(events, messages),
    "Event Taxonomy"
  );
  XLSX.utils.book_append_sheet(wb, buildTagsSheet(messages, tags), "Tags");
  XLSX.utils.book_append_sheet(
    wb,
    buildChannelStrategySheet(messages),
    "Channel Strategy"
  );

  return wb;
}

export function writeWorkbook(workbook: XLSX.WorkBook, filePath: string): void {
  const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  writeFileSync(filePath, buf);
}
