// =============================================================================
// Mango Lollipop — Mermaid Journey Map Generation
// =============================================================================

import type { Message, Channel, AARRRStage } from "./schema.js";

// -----------------------------------------------------------------------------
// Stage configuration
// -----------------------------------------------------------------------------

interface StageConfig {
  label: string;
  emoji: string;
  fill: string;
  stroke: string;
}

const STAGE_CONFIG: Record<AARRRStage | "TX", StageConfig> = {
  TX: { label: "Transactional", emoji: "\u26aa", fill: "#f0f0f0", stroke: "#999" },
  AQ: { label: "Acquisition", emoji: "\ud83d\udfe2", fill: "#d4edda", stroke: "#28a745" },
  AC: { label: "Activation", emoji: "\ud83d\udfe5", fill: "#cce5ff", stroke: "#007bff" },
  RV: { label: "Revenue", emoji: "\ud83d\udfe1", fill: "#fff3cd", stroke: "#ffc107" },
  RT: { label: "Retention", emoji: "\ud83d\udfe0", fill: "#ffe5cc", stroke: "#fd7e14" },
  RF: { label: "Referral", emoji: "\ud83d\udfe3", fill: "#e8d5f5", stroke: "#6f42c1" },
};

// Channel emoji indicators
const CHANNEL_ICONS: Record<Channel, string> = {
  email: "\ud83d\udce7",
  "in-app": "\ud83d\udcf1",
  push: "\ud83d\udd14",
  sms: "\ud83d\udcac",
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function channelIndicators(channels: Channel[]): string {
  return channels.map((ch) => CHANNEL_ICONS[ch]).join("");
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, "");
}

function sanitizeLabel(text: string): string {
  // Escape characters that break Mermaid labels
  return text.replace(/"/g, "'").replace(/[[\](){}]/g, "");
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export function generateJourneyMap(messages: Message[]): string {
  const lines: string[] = ["graph TD"];

  // Group messages by stage
  const stages: (AARRRStage | "TX")[] = ["TX", "AQ", "AC", "RV", "RT", "RF"];
  const grouped = new Map<string, Message[]>();
  for (const stage of stages) {
    grouped.set(
      stage,
      messages.filter((m) => m.stage === stage)
    );
  }

  // Build subgraphs per stage
  for (const stage of stages) {
    const stageMessages = grouped.get(stage) ?? [];
    if (stageMessages.length === 0) continue;

    const cfg = STAGE_CONFIG[stage];
    lines.push("");
    lines.push(
      `    subgraph ${stage}["${cfg.emoji} ${cfg.label}"]`
    );

    for (const msg of stageMessages) {
      const nodeId = sanitizeId(msg.id);
      const icons = channelIndicators(msg.channels);
      const label = sanitizeLabel(msg.name);
      lines.push(`        ${nodeId}[${icons} ${msg.id}: ${label}]`);
    }

    lines.push("    end");
  }

  // Build edges: connect messages within each lifecycle stage sequentially
  lines.push("");

  for (const stage of stages) {
    const stageMessages = grouped.get(stage) ?? [];
    if (stageMessages.length < 2) continue;

    for (let i = 0; i < stageMessages.length - 1; i++) {
      const from = sanitizeId(stageMessages[i].id);
      const to = sanitizeId(stageMessages[i + 1].id);
      const wait = stageMessages[i + 1].wait;
      lines.push(`    ${from} -->|${wait}| ${to}`);
    }
  }

  // Build suppression edges (dotted lines)
  let suppressionCounter = 0;
  for (const msg of messages) {
    if (msg.suppressions.length > 0) {
      const nodeId = sanitizeId(msg.id);
      for (const sup of msg.suppressions) {
        suppressionCounter++;
        const skipId = `SKIP${suppressionCounter}`;
        const condLabel = sanitizeLabel(sup.condition);
        lines.push(
          `    ${nodeId} -.->|suppressed: ${condLabel}| ${skipId}[Skip]`
        );
      }
    }
  }

  // Connect key cross-stage flows
  // AQ last message -> AC first message (if both exist)
  const aqMsgs = grouped.get("AQ") ?? [];
  const acMsgs = grouped.get("AC") ?? [];
  if (aqMsgs.length > 0 && acMsgs.length > 0) {
    const lastAQ = sanitizeId(aqMsgs[aqMsgs.length - 1].id);
    const firstAC = sanitizeId(acMsgs[0].id);
    const wait = acMsgs[0].wait;
    lines.push(`    ${lastAQ} -->|${wait}| ${firstAC}`);
  }

  // Guard decision diamonds
  for (const msg of messages) {
    if (msg.guards.length > 0) {
      const nodeId = sanitizeId(msg.id);
      for (const guard of msg.guards) {
        const guardId = `G_${nodeId}`;
        const condLabel = sanitizeLabel(guard.condition);
        lines.push(`    ${guardId}{${condLabel}} -->|Yes| ${nodeId}`);
      }
    }
  }

  // Apply styles
  lines.push("");
  for (const stage of stages) {
    const stageMessages = grouped.get(stage) ?? [];
    if (stageMessages.length === 0) continue;
    const cfg = STAGE_CONFIG[stage];
    lines.push(
      `    style ${stage} fill:${cfg.fill},stroke:${cfg.stroke}`
    );
  }

  return lines.join("\n");
}
