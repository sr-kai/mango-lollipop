// =============================================================================
// Mango Lollipop — TypeScript Schema & Validation
// =============================================================================

// -----------------------------------------------------------------------------
// Type Aliases
// -----------------------------------------------------------------------------

export type Channel = "email" | "sms" | "in-app" | "push";

export type AARRRStage = "AQ" | "AC" | "RV" | "RT" | "RF";

// -----------------------------------------------------------------------------
// Core Message Interfaces
// -----------------------------------------------------------------------------

export interface Trigger {
  event: string;
  type: "event" | "scheduled" | "behavioral";
  schedule?: string;
}

export interface Guard {
  condition: string;
  expression: string;
}

export interface Suppression {
  condition: string;
  expression: string;
}

export interface CTA {
  text: string;
  url?: string;
}

export interface Message {
  id: string;
  stage: AARRRStage | "TX";
  name: string;
  classification: "transactional" | "lifecycle";
  trigger: Trigger;
  wait: string;
  guards: Guard[];
  suppressions: Suppression[];
  subject: string;
  preheader?: string;
  body: string;
  cta: CTA;
  channels: Channel[];
  format: "plain" | "rich";
  from: string;
  segment: string;
  tags: string[];
  goal: string;
  comments: string;
}

// -----------------------------------------------------------------------------
// Voice & Persona Interfaces
// -----------------------------------------------------------------------------

export interface SenderPersona {
  name: string;
  role: string;
  use_for: string[];
}

export interface VoiceProfile {
  tone: string;
  formality: number; // 1-5
  emoji_usage: "none" | "light" | "heavy";
  signature_style: string;
  sample_phrases: string[];
  sender_personas: SenderPersona[];
}

// -----------------------------------------------------------------------------
// Event Taxonomy
// -----------------------------------------------------------------------------

export interface EventTaxonomy {
  identity: string[];
  activation: string[];
  engagement: string[];
  conversion: string[];
  retention: string[];
}

// -----------------------------------------------------------------------------
// Analysis (analysis.json output from the analyze skill)
// -----------------------------------------------------------------------------

export interface AnalysisCompany {
  name: string;
  product_type: string;
  target_audience: string;
  key_value_prop: string;
  aha_moment: string;
  key_features: string[];
  pricing_model: string;
}

export interface AnalysisTags {
  sources: string[];
  plans: string[];
  segments: string[];
  features: string[];
}

export interface ExistingPerformance {
  open_rate_avg: string;
  click_rate_avg: string;
  problem_areas: string[];
}

export interface ExistingMessaging {
  messages_count: number;
  stages_covered: (AARRRStage | "TX")[];
  stages_missing: (AARRRStage | "TX")[];
  channels_used: Channel[];
  performance: ExistingPerformance;
  primary_goal: string;
  messages: unknown[];
}

export interface Analysis {
  path: "fresh" | "existing";
  company: AnalysisCompany;
  channels: Channel[];
  voice: VoiceProfile;
  events: EventTaxonomy;
  tags: AnalysisTags;
  existing?: ExistingMessaging;
  recommendations: string[];
}

// -----------------------------------------------------------------------------
// Project Config (mango-lollipop.json)
// -----------------------------------------------------------------------------

export interface ProjectConfig {
  name: string;
  version: string;
  created: string;
  stage: string;
  path: "fresh" | "existing" | null;
  channels: Channel[];
  analysis: Analysis | null;
  matrix: { messages: Message[] } | null;
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const VALID_CHANNELS: Channel[] = ["email", "sms", "in-app", "push"];
const VALID_STAGES: (AARRRStage | "TX")[] = ["AQ", "AC", "RV", "RT", "RF", "TX"];
const VALID_AARRR_STAGES: AARRRStage[] = ["AQ", "AC", "RV", "RT", "RF"];

// ISO 8601 duration pattern: P[nY][nM][nD][T[nH][nM][nS]] or PnW
const ISO_8601_DURATION_RE =
  /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$|^P(\d+)W$/;

// -----------------------------------------------------------------------------
// Type Guards
// -----------------------------------------------------------------------------

export function isValidChannel(ch: unknown): ch is Channel {
  return typeof ch === "string" && VALID_CHANNELS.includes(ch as Channel);
}

export function isValidStage(stage: unknown): stage is AARRRStage {
  return typeof stage === "string" && VALID_AARRR_STAGES.includes(stage as AARRRStage);
}

// -----------------------------------------------------------------------------
// Validation Helpers
// -----------------------------------------------------------------------------

export function isValidWaitDuration(wait: unknown): boolean {
  if (typeof wait !== "string") return false;
  return ISO_8601_DURATION_RE.test(wait);
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateMessage(msg: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof msg !== "object" || msg === null) {
    return { valid: false, errors: ["Message must be a non-null object"] };
  }

  const m = msg as Record<string, unknown>;

  // Required string fields
  const requiredStrings: [string, string][] = [
    ["id", "id"],
    ["name", "name"],
    ["subject", "subject"],
    ["body", "body"],
    ["from", "from"],
    ["segment", "segment"],
    ["goal", "goal"],
    ["wait", "wait"],
  ];

  for (const [field, label] of requiredStrings) {
    if (typeof m[field] !== "string" || (m[field] as string).length === 0) {
      errors.push(`Missing or empty required field: ${label}`);
    }
  }

  // Stage
  const validStagesAll = VALID_STAGES;
  if (typeof m.stage !== "string" || !validStagesAll.includes(m.stage as AARRRStage | "TX")) {
    errors.push(`Invalid stage: "${String(m.stage)}". Must be one of: ${validStagesAll.join(", ")}`);
  }

  // Classification
  if (m.classification !== "transactional" && m.classification !== "lifecycle") {
    errors.push(`Invalid classification: "${String(m.classification)}". Must be "transactional" or "lifecycle"`);
  }

  // Wait duration
  if (typeof m.wait === "string" && !isValidWaitDuration(m.wait)) {
    errors.push(`Invalid wait duration: "${m.wait}". Must be ISO 8601 duration (e.g. "P0D", "PT5M", "P2D")`);
  }

  // Format
  if (m.format !== "plain" && m.format !== "rich") {
    errors.push(`Invalid format: "${String(m.format)}". Must be "plain" or "rich"`);
  }

  // Channels
  if (!Array.isArray(m.channels) || m.channels.length === 0) {
    errors.push("Must have at least one channel");
  } else {
    for (const ch of m.channels) {
      if (!isValidChannel(ch)) {
        errors.push(`Invalid channel: "${String(ch)}". Must be one of: ${VALID_CHANNELS.join(", ")}`);
      }
    }
  }

  // Tags
  if (!Array.isArray(m.tags)) {
    errors.push("tags must be an array");
  }

  // Guards
  if (!Array.isArray(m.guards)) {
    errors.push("guards must be an array");
  }

  // Suppressions
  if (!Array.isArray(m.suppressions)) {
    errors.push("suppressions must be an array");
  }

  // Trigger
  if (typeof m.trigger !== "object" || m.trigger === null) {
    errors.push("trigger must be a non-null object");
  } else {
    const t = m.trigger as Record<string, unknown>;
    if (typeof t.event !== "string" || t.event.length === 0) {
      errors.push("trigger.event is required");
    }
    if (t.type !== "event" && t.type !== "scheduled" && t.type !== "behavioral") {
      errors.push(`Invalid trigger.type: "${String(t.type)}". Must be "event", "scheduled", or "behavioral"`);
    }
  }

  // CTA
  if (typeof m.cta !== "object" || m.cta === null) {
    errors.push("cta must be a non-null object");
  } else {
    const c = m.cta as Record<string, unknown>;
    if (typeof c.text !== "string" || c.text.length === 0) {
      errors.push("cta.text is required");
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateAnalysis(analysis: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof analysis !== "object" || analysis === null) {
    return { valid: false, errors: ["Analysis must be a non-null object"] };
  }

  const a = analysis as Record<string, unknown>;

  // Path
  if (a.path !== "fresh" && a.path !== "existing") {
    errors.push(`Invalid path: "${String(a.path)}". Must be "fresh" or "existing"`);
  }

  // Company
  if (typeof a.company !== "object" || a.company === null) {
    errors.push("company is required");
  } else {
    const c = a.company as Record<string, unknown>;
    const companyFields = ["name", "product_type", "target_audience", "key_value_prop", "aha_moment", "pricing_model"];
    for (const field of companyFields) {
      if (typeof c[field] !== "string" || (c[field] as string).length === 0) {
        errors.push(`Missing or empty company.${field}`);
      }
    }
    if (!Array.isArray(c.key_features) || c.key_features.length === 0) {
      errors.push("company.key_features must be a non-empty array");
    }
  }

  // Channels
  if (!Array.isArray(a.channels) || a.channels.length === 0) {
    errors.push("Must have at least one channel");
  } else {
    for (const ch of a.channels) {
      if (!isValidChannel(ch)) {
        errors.push(`Invalid channel: "${String(ch)}". Must be one of: ${VALID_CHANNELS.join(", ")}`);
      }
    }
  }

  // Voice
  if (typeof a.voice !== "object" || a.voice === null) {
    errors.push("voice profile is required");
  } else {
    const v = a.voice as Record<string, unknown>;
    if (typeof v.tone !== "string" || (v.tone as string).length === 0) {
      errors.push("voice.tone is required");
    }
    if (typeof v.formality !== "number" || v.formality < 1 || v.formality > 5) {
      errors.push("voice.formality must be a number between 1 and 5");
    }
    if (v.emoji_usage !== "none" && v.emoji_usage !== "light" && v.emoji_usage !== "heavy") {
      errors.push(`Invalid voice.emoji_usage: "${String(v.emoji_usage)}". Must be "none", "light", or "heavy"`);
    }
    if (!Array.isArray(v.sample_phrases)) {
      errors.push("voice.sample_phrases must be an array");
    }
    if (!Array.isArray(v.sender_personas)) {
      errors.push("voice.sender_personas must be an array");
    }
  }

  // Events
  if (typeof a.events !== "object" || a.events === null) {
    errors.push("events taxonomy is required");
  } else {
    const e = a.events as Record<string, unknown>;
    const eventCategories = ["identity", "activation", "engagement", "conversion", "retention"];
    for (const cat of eventCategories) {
      if (!Array.isArray(e[cat])) {
        errors.push(`events.${cat} must be an array`);
      }
    }
  }

  // Tags
  if (typeof a.tags !== "object" || a.tags === null) {
    errors.push("tags is required");
  }

  // Recommendations
  if (!Array.isArray(a.recommendations)) {
    errors.push("recommendations must be an array");
  }

  // PATH B: existing (only validated if path is "existing")
  if (a.path === "existing") {
    if (typeof a.existing !== "object" || a.existing === null) {
      errors.push('existing messaging data is required when path is "existing"');
    } else {
      const ex = a.existing as Record<string, unknown>;
      if (typeof ex.messages_count !== "number") {
        errors.push("existing.messages_count must be a number");
      }
      if (!Array.isArray(ex.stages_covered)) {
        errors.push("existing.stages_covered must be an array");
      }
      if (!Array.isArray(ex.stages_missing)) {
        errors.push("existing.stages_missing must be an array");
      }
      if (typeof ex.primary_goal !== "string") {
        errors.push("existing.primary_goal is required");
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
