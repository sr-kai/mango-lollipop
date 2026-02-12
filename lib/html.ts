// =============================================================================
// Mango Lollipop — HTML Generation (Dashboard + Overview)
// =============================================================================

import type { Message, Analysis, AARRRStage } from "./schema.js";

// -----------------------------------------------------------------------------
// Stage display names and colors
// -----------------------------------------------------------------------------

const STAGE_META: Record<
  AARRRStage | "TX",
  { label: string; color: string; bg: string }
> = {
  TX: { label: "Transactional", color: "#666", bg: "#f0f0f0" },
  AQ: { label: "Acquisition", color: "#28a745", bg: "#d4edda" },
  AC: { label: "Activation", color: "#007bff", bg: "#cce5ff" },
  RV: { label: "Revenue", color: "#ffc107", bg: "#fff3cd" },
  RT: { label: "Retention", color: "#fd7e14", bg: "#ffe5cc" },
  RF: { label: "Referral", color: "#6f42c1", bg: "#e8d5f5" },
};

// -----------------------------------------------------------------------------
// Shared helpers
// -----------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildStatsBlock(messages: Message[]): {
  total: number;
  txCount: number;
  lcCount: number;
  byStage: Record<string, number>;
  byChannel: Record<string, number>;
  allTags: string[];
  tagCounts: Record<string, number>;
} {
  const tx = messages.filter((m) => m.classification === "transactional");
  const lc = messages.filter((m) => m.classification === "lifecycle");

  const byStage: Record<string, number> = {};
  const byChannel: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};

  for (const m of messages) {
    byStage[m.stage] = (byStage[m.stage] ?? 0) + 1;
    // Support singular channel and legacy channels array
    const ch = m.channel ?? ((m as any).channels?.[0]);
    if (ch) byChannel[ch] = (byChannel[ch] ?? 0) + 1;
    for (const tag of m.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }

  return {
    total: messages.length,
    txCount: tx.length,
    lcCount: lc.length,
    byStage,
    byChannel,
    allTags: Object.keys(tagCounts).sort(),
    tagCounts,
  };
}

// -----------------------------------------------------------------------------
// Dashboard HTML
// -----------------------------------------------------------------------------

export function generateDashboard(
  messages: Message[],
  analysis: Analysis
): string {
  const stats = buildStatsBlock(messages);
  const dataJson = JSON.stringify(messages);
  const analysisJson = JSON.stringify(analysis);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(analysis.company.name)} - Lifecycle Messaging Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .stage-badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .tag-pill { display: inline-block; padding: 1px 6px; border-radius: 9999px; font-size: 0.7rem; background: #e5e7eb; color: #374151; cursor: pointer; margin: 1px; }
    .tag-pill.active { background: #3b82f6; color: white; }
    .filter-item { display: flex; justify-content: space-between; align-items: center; padding: 3px 6px; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
    .filter-item:hover { background: #f3f4f6; }
    .filter-item.active { background: #dbeafe; }
    .collapse-btn { cursor: pointer; user-select: none; display: flex; align-items: center; justify-content: space-between; width: 100%; }
    .collapse-btn .arrow { transition: transform 0.15s; font-size: 0.7rem; color: #9ca3af; }
    .collapse-btn .arrow.open { transform: rotate(90deg); }
    .collapse-body { overflow: hidden; }
    .collapse-body.collapsed { display: none; }
    .msg-row { cursor: pointer; }
    .msg-row:hover { background: #f9fafb; }
    .msg-detail { display: none; }
    .msg-detail.open { display: table-row; }
    .sortable { cursor: pointer; user-select: none; }
    .sortable:hover { color: #3b82f6; }
    .sortable::after { content: ' \\2195'; font-size: 0.7em; opacity: 0.4; }
  </style>
</head>
<body class="bg-gray-50 text-gray-900">

  <!-- Inline data -->
  <script id="msg-data" type="application/json">${dataJson}</script>
  <script id="analysis-data" type="application/json">${analysisJson}</script>

  <!-- Header -->
  <header class="bg-white border-b px-6 py-4 flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold">${escapeHtml(analysis.company.name)} &mdash; Lifecycle Messaging Dashboard</h1>
      <p class="text-sm text-gray-500">${escapeHtml(analysis.company.product_type)} &bull; ${stats.total} messages &bull; ${stats.txCount} transactional, ${stats.lcCount} lifecycle</p>
    </div>
    <div class="flex gap-2">
      <button id="btn-all" class="px-3 py-1 text-sm rounded border border-gray-300 bg-white hover:bg-gray-100" onclick="setView('all')">All</button>
      <button id="btn-tx" class="px-3 py-1 text-sm rounded border border-gray-300 bg-white hover:bg-gray-100" onclick="setView('tx')">Transactional</button>
      <button id="btn-lc" class="px-3 py-1 text-sm rounded border border-gray-300 bg-white hover:bg-gray-100" onclick="setView('lc')">Lifecycle</button>
    </div>
  </header>

  <div class="flex">
    <!-- Sidebar: Filters -->
    <aside class="w-56 bg-white border-r p-4 min-h-screen space-y-1">

      <!-- Stage filter -->
      <div>
        <button class="collapse-btn" onclick="toggleCollapse('stage-filter')">
          <span class="text-sm font-semibold text-gray-500 uppercase">Stage</span>
          <span class="arrow open" id="arrow-stage-filter">&#9654;</span>
        </button>
        <div id="stage-filter" class="collapse-body mt-1 space-y-0.5">
${Object.entries(stats.byStage)
  .map(([stage, count]) => {
    const meta = STAGE_META[stage as AARRRStage | "TX"] ?? {
      label: stage,
      color: "#666",
      bg: "#f0f0f0",
    };
    return `          <div class="filter-item" data-stage="${stage}" onclick="toggleStage(this)"><span class="stage-badge" style="background:${meta.bg};color:${meta.color}">${meta.label}</span><span class="text-xs text-gray-400">${count}</span></div>`;
  })
  .join("\n")}
        </div>
      </div>

      <!-- Channel filter -->
      <div>
        <button class="collapse-btn" onclick="toggleCollapse('channel-filter')">
          <span class="text-sm font-semibold text-gray-500 uppercase">Channel</span>
          <span class="arrow open" id="arrow-channel-filter">&#9654;</span>
        </button>
        <div id="channel-filter" class="collapse-body mt-1 space-y-0.5">
${Object.entries(stats.byChannel)
  .map(
    ([ch, count]) =>
      `          <div class="filter-item" data-channel="${escapeHtml(ch)}" onclick="toggleChannel(this)"><span>${escapeHtml(ch)}</span><span class="text-xs text-gray-400">${count}</span></div>`
  )
  .join("\n")}
        </div>
      </div>

      <!-- Tag filter -->
      <div>
        <button class="collapse-btn" onclick="toggleCollapse('tag-filter')">
          <span class="text-sm font-semibold text-gray-500 uppercase">Tags</span>
          <span class="arrow open" id="arrow-tag-filter">&#9654;</span>
        </button>
        <div id="tag-filter" class="collapse-body mt-1">
${stats.allTags
  .map(
    (tag) =>
      `          <span class="tag-pill" data-tag="${escapeHtml(tag)}" onclick="toggleTag(this)">${escapeHtml(tag)} <span class="text-gray-400">(${stats.tagCounts[tag]})</span></span>`
  )
  .join("\n")}
        </div>
      </div>

      <button class="mt-2 text-xs text-blue-500 hover:underline" onclick="clearAllFilters()">Clear all filters</button>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-6 space-y-8">

      <!-- Matrix Table -->
      <section>
        <h2 class="text-lg font-semibold mb-3">Message Matrix</h2>
        <div class="bg-white rounded-lg border overflow-x-auto">
          <table class="w-full text-sm" id="matrix-table">
            <thead class="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th class="px-3 py-2 sortable" data-col="id" onclick="sortTable('id')">ID</th>
                <th class="px-3 py-2 sortable" data-col="stage" onclick="sortTable('stage')">Stage</th>
                <th class="px-3 py-2 sortable" data-col="name" onclick="sortTable('name')">Name</th>
                <th class="px-3 py-2">Trigger</th>
                <th class="px-3 py-2 sortable" data-col="wait" onclick="sortTable('wait')">Wait</th>
                <th class="px-3 py-2">Channel</th>
                <th class="px-3 py-2">CTA</th>
                <th class="px-3 py-2">Tags</th>
              </tr>
            </thead>
            <tbody id="matrix-body">
            </tbody>
          </table>
        </div>
      </section>

    </main>
  </div>

  <script>
    const allMessages = JSON.parse(document.getElementById('msg-data').textContent);
    let currentView = 'all';
    let activeStages = new Set();
    let activeChannels = new Set();
    let activeTags = new Set();
    let sortCol = 'id';
    let sortAsc = true;

    const stageMeta = ${JSON.stringify(STAGE_META)};

    // --- Collapse ---
    function toggleCollapse(id) {
      const body = document.getElementById(id);
      const arrow = document.getElementById('arrow-' + id);
      body.classList.toggle('collapsed');
      arrow.classList.toggle('open');
    }

    // --- View toggle ---
    function setView(view) {
      currentView = view;
      document.getElementById('btn-all').classList.toggle('bg-blue-100', view === 'all');
      document.getElementById('btn-tx').classList.toggle('bg-blue-100', view === 'tx');
      document.getElementById('btn-lc').classList.toggle('bg-blue-100', view === 'lc');
      render();
    }

    // --- Stage filter ---
    function toggleStage(el) {
      const stage = el.dataset.stage;
      if (activeStages.has(stage)) { activeStages.delete(stage); el.classList.remove('active'); }
      else { activeStages.add(stage); el.classList.add('active'); }
      render();
    }

    // --- Channel filter ---
    function toggleChannel(el) {
      const ch = el.dataset.channel;
      if (activeChannels.has(ch)) { activeChannels.delete(ch); el.classList.remove('active'); }
      else { activeChannels.add(ch); el.classList.add('active'); }
      render();
    }

    // --- Tag filter ---
    function toggleTag(el) {
      const tag = el.dataset.tag;
      if (activeTags.has(tag)) { activeTags.delete(tag); el.classList.remove('active'); }
      else { activeTags.add(tag); el.classList.add('active'); }
      render();
    }

    function clearAllFilters() {
      activeStages.clear();
      activeChannels.clear();
      activeTags.clear();
      document.querySelectorAll('.filter-item.active, .tag-pill.active').forEach(el => el.classList.remove('active'));
      currentView = 'all';
      document.getElementById('btn-all').classList.add('bg-blue-100');
      document.getElementById('btn-tx').classList.remove('bg-blue-100');
      document.getElementById('btn-lc').classList.remove('bg-blue-100');
      render();
    }

    function sortTable(col) {
      if (sortCol === col) sortAsc = !sortAsc;
      else { sortCol = col; sortAsc = true; }
      render();
    }

    function esc(s) {
      const d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    function getMsgChannel(m) {
      return m.channel || (m.channels && m.channels[0]) || '';
    }

    function render() {
      let msgs = allMessages;

      // View filter
      if (currentView === 'tx') msgs = msgs.filter(m => m.classification === 'transactional');
      if (currentView === 'lc') msgs = msgs.filter(m => m.classification === 'lifecycle');

      // Stage filter (OR within stages)
      if (activeStages.size > 0) msgs = msgs.filter(m => activeStages.has(m.stage));

      // Channel filter (OR within channels)
      if (activeChannels.size > 0) msgs = msgs.filter(m => activeChannels.has(getMsgChannel(m)));

      // Tag filter (OR within tags)
      if (activeTags.size > 0) msgs = msgs.filter(m => m.tags.some(t => activeTags.has(t)));

      msgs.sort((a, b) => {
        let va = a[sortCol] ?? '';
        let vb = b[sortCol] ?? '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return sortAsc ? -1 : 1;
        if (va > vb) return sortAsc ? 1 : -1;
        return 0;
      });

      const tbody = document.getElementById('matrix-body');
      tbody.innerHTML = '';
      for (const m of msgs) {
        const meta = stageMeta[m.stage] || { label: m.stage, color: '#666', bg: '#f0f0f0' };
        const ch = getMsgChannel(m);
        const tr = document.createElement('tr');
        tr.className = 'msg-row border-t';
        tr.innerHTML =
          '<td class="px-3 py-2 font-mono text-xs">' + esc(m.id) + '</td>' +
          '<td class="px-3 py-2"><span class="stage-badge" style="background:' + meta.bg + ';color:' + meta.color + '">' + esc(meta.label) + '</span></td>' +
          '<td class="px-3 py-2 font-medium">' + esc(m.name) + '</td>' +
          '<td class="px-3 py-2 text-xs text-gray-600">' + esc(m.trigger.event) + '</td>' +
          '<td class="px-3 py-2 font-mono text-xs">' + esc(m.wait) + '</td>' +
          '<td class="px-3 py-2 text-xs">' + esc(ch) + '</td>' +
          '<td class="px-3 py-2 text-xs">' + esc(m.cta.text) + '</td>' +
          '<td class="px-3 py-2">' + m.tags.map(t => '<span class="tag-pill">' + esc(t) + '</span>').join(' ') + '</td>';
        tr.addEventListener('click', () => toggleDetail(m.id));
        tbody.appendChild(tr);

        // Detail row
        const detail = document.createElement('tr');
        detail.id = 'detail-' + m.id;
        detail.className = 'msg-detail bg-gray-50';
        detail.innerHTML =
          '<td colspan="8" class="px-6 py-4 text-sm">' +
          '<div class="grid grid-cols-2 gap-4">' +
          (m.subject ? '<div><strong>Subject:</strong> ' + esc(m.subject) + '</div>' : '') +
          '<div><strong>From:</strong> ' + esc(m.from) + '</div>' +
          '<div><strong>Segment:</strong> ' + esc(m.segment) + '</div>' +
          '<div><strong>Goal:</strong> ' + esc(m.goal) + '</div>' +
          '<div><strong>Format:</strong> ' + esc(m.format) + '</div>' +
          '<div><strong>Guards:</strong> ' + (m.guards.length ? m.guards.map(g => esc(g.condition)).join('; ') : '\\u2014') + '</div>' +
          '<div><strong>Suppressions:</strong> ' + (m.suppressions.length ? m.suppressions.map(s => esc(s.condition)).join('; ') : '\\u2014') + '</div>' +
          '<div class="col-span-2"><strong>Comments:</strong> ' + esc(m.comments || '') + '</div>' +
          '</div>' +
          (m.body ? '<div class="mt-3"><strong>Body:</strong><pre class="mt-1 p-3 bg-white border rounded text-xs whitespace-pre-wrap">' + esc(m.body) + '</pre></div>' : '') +
          '<div class="mt-3"><a href="messages.html#' + encodeURIComponent(m.id) + '" style="color:#3b82f6;font-size:0.8rem;text-decoration:none" onmouseover="this.style.textDecoration=\\'underline\\'" onmouseout="this.style.textDecoration=\\'none\\'">Open full preview &rarr;</a></div>' +
          '</td>';
        tbody.appendChild(detail);
      }
    }

    function toggleDetail(id) {
      const el = document.getElementById('detail-' + id);
      if (el) el.classList.toggle('open');
    }

    // Initial render
    setView('all');
  </script>

  <footer style="text-align:center;padding:16px;font-size:0.75rem;color:#9ca3af;border-top:1px solid #e5e7eb">
    <a href="https://github.com/sr-kai/mango-lollipop" style="color:#6b7280;text-decoration:none;font-weight:600">Mango Lollipop</a> &mdash; AI-powered lifecycle messaging for SaaS<br>
    Made by Sasha Kai with probably too much coffee.
  </footer>
</body>
</html>`;
}

// -----------------------------------------------------------------------------
// Overview HTML (clean, printable)
// -----------------------------------------------------------------------------

export function generateOverview(
  messages: Message[],
  analysis: Analysis
): string {
  const stats = buildStatsBlock(messages);
  const stages: (AARRRStage | "TX")[] = ["TX", "AQ", "AC", "RV", "RT", "RF"];

  // Build implementation order: TX first, then AQ -> RF
  const implOrder = stages
    .filter((s) => (stats.byStage[s] ?? 0) > 0)
    .map((s, i) => {
      const meta = STAGE_META[s];
      const count = stats.byStage[s] ?? 0;
      return `<tr><td class="px-3 py-1">${i + 1}</td><td class="px-3 py-1"><span class="stage-badge" style="background:${meta.bg};color:${meta.color}">${meta.label}</span></td><td class="px-3 py-1">${count} messages</td></tr>`;
    })
    .join("\n");

  // Build condensed matrix rows
  const matrixRows = messages
    .map((m) => {
      const meta = STAGE_META[m.stage] ?? {
        label: m.stage,
        color: "#666",
        bg: "#f0f0f0",
      };
      return `<tr class="border-t">
        <td class="px-3 py-1 font-mono text-xs">${escapeHtml(m.id)}</td>
        <td class="px-3 py-1"><span class="stage-badge" style="background:${meta.bg};color:${meta.color}">${escapeHtml(meta.label)}</span></td>
        <td class="px-3 py-1">${escapeHtml(m.name)}</td>
        <td class="px-3 py-1 text-xs">${escapeHtml(m.trigger.event)}</td>
        <td class="px-3 py-1 font-mono text-xs">${escapeHtml(m.wait)}</td>
        <td class="px-3 py-1 text-xs">${escapeHtml(m.channel ?? ((m as any).channels?.[0] ?? ""))}</td>
      </tr>`;
    })
    .join("\n");

  // Tag summary
  const tagSummary = stats.allTags
    .map(
      (t) =>
        `<span class="tag-pill">${escapeHtml(t)} (${stats.tagCounts[t]})</span>`
    )
    .join(" ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(analysis.company.name)} - Lifecycle Messaging Overview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print { body { font-size: 11px; } .page-break { page-break-before: always; } }
    .stage-badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .tag-pill { display: inline-block; padding: 1px 6px; border-radius: 9999px; font-size: 0.7rem; background: #e5e7eb; color: #374151; margin: 1px; }
  </style>
</head>
<body class="bg-white text-gray-900 max-w-4xl mx-auto p-8">

  <!-- Inline data -->
  <script id="msg-data" type="application/json">${JSON.stringify(messages)}</script>
  <script id="analysis-data" type="application/json">${JSON.stringify(analysis)}</script>

  <header class="border-b pb-4 mb-6">
    <h1 class="text-2xl font-bold">${escapeHtml(analysis.company.name)}</h1>
    <p class="text-gray-500">Lifecycle Messaging Overview</p>
  </header>

  <!-- Company Overview -->
  <section class="mb-8">
    <h2 class="text-lg font-semibold mb-2">Company Overview</h2>
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div><strong>Product Type:</strong> ${escapeHtml(analysis.company.product_type)}</div>
      <div><strong>Target Audience:</strong> ${escapeHtml(analysis.company.target_audience)}</div>
      <div><strong>Value Prop:</strong> ${escapeHtml(analysis.company.key_value_prop)}</div>
      <div><strong>Aha Moment:</strong> ${escapeHtml(analysis.company.aha_moment)}</div>
      <div><strong>Pricing:</strong> ${escapeHtml(analysis.company.pricing_model)}</div>
      <div><strong>Key Features:</strong> ${analysis.company.key_features.map((f) => escapeHtml(f)).join(", ")}</div>
    </div>
  </section>

  <!-- AARRR Strategy -->
  <section class="mb-8">
    <h2 class="text-lg font-semibold mb-2">AARRR Strategy Summary</h2>
    <div class="text-sm space-y-1">
      <p><strong>Total Messages:</strong> ${stats.total} (${stats.txCount} transactional, ${stats.lcCount} lifecycle)</p>
      <p><strong>Channels:</strong> ${analysis.channels.join(", ")}</p>
      <div class="flex gap-4 mt-2">
${stages
  .filter((s) => (stats.byStage[s] ?? 0) > 0)
  .map((s) => {
    const meta = STAGE_META[s];
    return `        <div class="text-center"><span class="stage-badge" style="background:${meta.bg};color:${meta.color}">${meta.label}</span><div class="text-lg font-bold mt-1">${stats.byStage[s]}</div></div>`;
  })
  .join("\n")}
      </div>
    </div>
  </section>

  <div class="page-break"></div>

  <!-- Condensed Matrix -->
  <section class="mb-8">
    <h2 class="text-lg font-semibold mb-2">Message Inventory</h2>
    <table class="w-full text-sm border">
      <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
        <tr>
          <th class="px-3 py-2 text-left">ID</th>
          <th class="px-3 py-2 text-left">Stage</th>
          <th class="px-3 py-2 text-left">Name</th>
          <th class="px-3 py-2 text-left">Trigger</th>
          <th class="px-3 py-2 text-left">Wait</th>
          <th class="px-3 py-2 text-left">Channel</th>
        </tr>
      </thead>
      <tbody>
${matrixRows}
      </tbody>
    </table>
  </section>

  <!-- Tag Summary -->
  <section class="mb-8">
    <h2 class="text-lg font-semibold mb-2">Tag Summary</h2>
    <div>${tagSummary || "<span class='text-gray-400'>No tags</span>"}</div>
  </section>

  <!-- Implementation Order -->
  <section class="mb-8">
    <h2 class="text-lg font-semibold mb-2">Recommended Implementation Order</h2>
    <table class="text-sm">
      <thead class="text-xs text-gray-500 uppercase">
        <tr><th class="px-3 py-1 text-left">Priority</th><th class="px-3 py-1 text-left">Stage</th><th class="px-3 py-1 text-left">Scope</th></tr>
      </thead>
      <tbody>
${implOrder}
      </tbody>
    </table>
  </section>

  <!-- Recommendations -->
${
  analysis.recommendations.length > 0
    ? `  <section class="mb-8">
    <h2 class="text-lg font-semibold mb-2">Recommendations</h2>
    <ul class="list-disc list-inside text-sm space-y-1">
${analysis.recommendations.map((r) => `      <li>${escapeHtml(r)}</li>`).join("\n")}
    </ul>
  </section>`
    : ""
}

  <footer style="text-align:center;padding:24px 0 8px;margin-top:2rem;border-top:1px solid #e5e7eb;font-size:0.8rem;color:#9ca3af">
    <a href="https://github.com/sr-kai/mango-lollipop" style="color:#6b7280;text-decoration:none;font-weight:600">Mango Lollipop</a> &mdash; AI-powered lifecycle messaging for SaaS<br>
    Made by Sasha Kai with probably too much coffee.
  </footer>
</body>
</html>`;
}

// -----------------------------------------------------------------------------
// Message Viewer HTML (channel-specific previews with hash routing)
// -----------------------------------------------------------------------------

export function generateMessageViewer(
  messages: Message[],
  analysis: Analysis,
  messageContent: Record<string, string>
): string {
  const stages: (AARRRStage | "TX")[] = ["TX", "AQ", "AC", "RV", "RT", "RF"];

  // Build sidebar HTML server-side (static list)
  const sidebarHtml = stages
    .filter((s) => messages.some((m) => m.stage === s))
    .map((s) => {
      const meta = STAGE_META[s];
      const stageMessages = messages.filter((m) => m.stage === s);
      const items = stageMessages
        .map((m) => {
          const ch = m.channel ?? ((m as any).channels?.[0] ?? "");
          return `            <a href="#${escapeHtml(m.id)}" class="msg-link" id="sb-${escapeHtml(m.id)}" data-id="${escapeHtml(m.id)}">
              <span class="msg-link-id">${escapeHtml(m.id)}</span>
              <span class="msg-link-name">${escapeHtml(m.name)}</span>
              <span class="msg-link-ch">${escapeHtml(ch)}</span>
            </a>`;
        })
        .join("\n");
      return `          <div class="stage-group">
            <div class="stage-group-header">
              <span class="stage-badge" style="background:${meta.bg};color:${meta.color}">${meta.label}</span>
              <span class="text-xs text-gray-400">${stageMessages.length}</span>
            </div>
${items}
          </div>`;
    })
    .join("\n");

  const dataJson = JSON.stringify(messages);
  const contentJson = JSON.stringify(messageContent);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(analysis.company.name)} - Message Previews</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Layout */
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .viewer-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; background: #fff; border-bottom: 1px solid #e5e7eb; }
    .viewer-header a { color: #3b82f6; text-decoration: none; font-size: 0.875rem; }
    .viewer-header a:hover { text-decoration: underline; }
    .viewer-layout { display: flex; min-height: calc(100vh - 57px); }

    /* Sidebar */
    .viewer-sidebar { width: 260px; min-width: 260px; background: #fff; border-right: 1px solid #e5e7eb; overflow-y: auto; padding: 12px 8px; }
    .stage-group { margin-bottom: 8px; }
    .stage-group-header { display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; }
    .stage-badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
    .msg-link { display: flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 6px; text-decoration: none; color: #374151; font-size: 0.8rem; cursor: pointer; }
    .msg-link:hover { background: #f3f4f6; }
    .msg-link.active { background: #dbeafe; color: #1d4ed8; }
    .msg-link-id { font-family: monospace; font-size: 0.7rem; color: #9ca3af; min-width: 38px; }
    .msg-link.active .msg-link-id { color: #3b82f6; }
    .msg-link-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .msg-link-ch { font-size: 0.65rem; color: #9ca3af; text-transform: uppercase; }

    /* Preview area */
    .preview-main { flex: 1; background: #f3f4f6; padding: 32px; overflow-y: auto; }
    .preview-empty { display: flex; align-items: center; justify-content: center; height: 60vh; color: #9ca3af; font-size: 1rem; }
    .preview-wrapper { max-width: 740px; margin: 0 auto; }

    /* Shared preview elements */
    .preview-cta { display: inline-block; padding: 10px 24px; border-radius: 6px; color: #fff; font-weight: 600; font-size: 0.9rem; text-decoration: none; cursor: default; }
    .token { background: #fef3c7; color: #92400e; padding: 1px 4px; border-radius: 3px; font-family: monospace; font-size: 0.85em; }
    .no-content-notice { background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 8px; padding: 24px; text-align: center; color: #6b7280; margin: 20px; }

    /* --- Email preview --- */
    .email-frame { background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; max-width: 640px; margin: 0 auto; }
    .email-toolbar { background: #f9fafb; padding: 10px 16px; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid #e5e7eb; }
    .email-dot { width: 10px; height: 10px; border-radius: 50%; }
    .email-header { padding: 16px 20px; border-bottom: 1px solid #f3f4f6; font-size: 0.85rem; color: #6b7280; }
    .email-header div { margin-bottom: 4px; }
    .email-header .email-label { font-weight: 600; color: #374151; display: inline-block; width: 70px; }
    .email-subject-line { font-size: 1.1rem; font-weight: 600; color: #111827; }
    .email-preheader { font-size: 0.8rem; color: #9ca3af; padding: 0 20px; margin-top: 4px; }
    .email-body { padding: 24px 20px; font-size: 0.9rem; line-height: 1.7; color: #374151; }
    .email-body p { margin-bottom: 14px; }
    .email-body .preview-cta { background: #3b82f6; margin: 16px 0; }

    /* --- In-app preview --- */
    .inapp-backdrop { background: rgba(0,0,0,0.3); border-radius: 12px; padding: 60px 20px; display: flex; justify-content: center; align-items: flex-start; min-height: 300px; }
    .inapp-modal { background: #fff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); padding: 28px 24px; max-width: 380px; width: 100%; position: relative; }
    .inapp-close { position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 1.2rem; color: #9ca3af; cursor: default; }
    .inapp-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin-bottom: 12px; }
    .inapp-body { font-size: 0.9rem; color: #4b5563; line-height: 1.6; margin-bottom: 20px; }
    .inapp-modal .preview-cta { background: #8b5cf6; display: block; text-align: center; border-radius: 10px; }

    /* --- SMS preview --- */
    .sms-phone { background: #fff; border-radius: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); max-width: 340px; margin: 0 auto; overflow: hidden; border: 6px solid #1a1a1a; }
    .sms-status-bar { background: #1a1a1a; padding: 8px 20px 4px; display: flex; justify-content: space-between; color: #fff; font-size: 0.7rem; font-weight: 600; }
    .sms-header { background: #f2f2f7; padding: 12px 16px; text-align: center; font-weight: 600; font-size: 0.95rem; color: #111; border-bottom: 1px solid #e5e7eb; }
    .sms-body { background: #fff; padding: 20px 16px; min-height: 200px; }
    .sms-bubble { background: #e5e5ea; color: #111; padding: 10px 14px; border-radius: 18px; border-bottom-left-radius: 4px; font-size: 0.9rem; line-height: 1.5; max-width: 85%; display: inline-block; }
    .sms-time { text-align: center; font-size: 0.7rem; color: #8e8e93; margin-top: 8px; }
    .sms-home { height: 4px; width: 120px; background: #1a1a1a; border-radius: 2px; margin: 8px auto; }

    /* --- Push preview --- */
    .push-phone { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); max-width: 340px; margin: 0 auto; overflow: hidden; border: 6px solid #1a1a1a; padding: 40px 12px 20px; min-height: 300px; }
    .push-status-bar { display: flex; justify-content: space-between; color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 600; margin-bottom: 24px; padding: 0 8px; }
    .push-card { background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-radius: 14px; padding: 12px; display: flex; gap: 10px; align-items: flex-start; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .push-icon { width: 36px; height: 36px; border-radius: 8px; background: #f97316; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
    .push-content { flex: 1; min-width: 0; }
    .push-app-name { font-size: 0.7rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.03em; }
    .push-title { font-size: 0.85rem; font-weight: 600; color: #111827; margin-top: 2px; }
    .push-body-text { font-size: 0.8rem; color: #4b5563; margin-top: 2px; line-height: 1.4; }

    /* Details card */
    .details-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); padding: 20px 24px; margin-top: 24px; }
    .details-card h3 { font-size: 0.85rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 0.85rem; }
    .details-grid .detail-label { font-weight: 600; color: #374151; }
    .details-grid .detail-value { color: #6b7280; }
    .detail-full { grid-column: span 2; }

    /* Nav buttons */
    .nav-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
    .nav-btn { padding: 6px 14px; border-radius: 6px; border: 1px solid #d1d5db; background: #fff; color: #374151; font-size: 0.8rem; cursor: pointer; text-decoration: none; }
    .nav-btn:hover { background: #f9fafb; }
    .nav-btn.disabled { opacity: 0.4; pointer-events: none; }

    /* Channel label */
    .channel-label { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
    .channel-label.email { background: #dbeafe; color: #1d4ed8; }
    .channel-label.in-app { background: #ede9fe; color: #6d28d9; }
    .channel-label.sms { background: #d1fae5; color: #065f46; }
    .channel-label.push { background: #ffedd5; color: #c2410c; }
  </style>
</head>
<body class="bg-gray-50 text-gray-900">

  <!-- Embedded data -->
  <script id="msg-data" type="application/json">${dataJson}</script>
  <script id="content-data" type="application/json">${contentJson}</script>

  <!-- Header -->
  <div class="viewer-header">
    <div style="display:flex;align-items:center;gap:16px">
      <a href="dashboard.html">&larr; Dashboard</a>
      <h1 style="font-size:1rem;font-weight:700;margin:0">${escapeHtml(analysis.company.name)} &mdash; Message Previews</h1>
    </div>
    <span style="font-size:0.8rem;color:#9ca3af">${messages.length} messages</span>
  </div>

  <div class="viewer-layout">
    <!-- Sidebar -->
    <div class="viewer-sidebar">
${sidebarHtml}
    </div>

    <!-- Preview area -->
    <div class="preview-main" id="preview-main">
      <div class="preview-empty" id="empty-state">
        Select a message from the sidebar to preview
      </div>
      <div class="preview-wrapper" id="preview-wrapper" style="display:none"></div>
    </div>
  </div>

  <script>
    const messages = JSON.parse(document.getElementById('msg-data').textContent);
    const messageContent = JSON.parse(document.getElementById('content-data').textContent);
    const productName = ${JSON.stringify(escapeHtml(analysis.company.name))};

    const stageMeta = ${JSON.stringify(STAGE_META)};

    // ---- Helpers ----
    function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

    function getMsgChannel(m) { return m.channel || (m.channels && m.channels[0]) || 'email'; }

    function md(text) {
      if (!text) return '';
      return text
        .replace(/\\*\\*\\[(.+?)\\]\\*\\*/g, function(_, t) { return '<span class="preview-cta" style="background:#3b82f6">' + esc(t) + '</span>'; })
        .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
        .replace(/\\{\\{(\\w+)\\}\\}/g, '<span class="token">{{$1}}</span>')
        .replace(/\\n\\n/g, '</p><p>')
        .replace(/\\n/g, '<br>');
    }

    // ---- Parse channel content from markdown ----
    function parseContent(rawContent, channel) {
      if (!rawContent) return null;

      var channelNames = { 'email': 'Email', 'in-app': 'In-App', 'sms': 'SMS', 'push': 'Push Notification' };
      var sectionName = channelNames[channel] || channel;

      // Split by ## headers
      var sections = rawContent.split(/^## /m);
      var body = rawContent;

      for (var i = 0; i < sections.length; i++) {
        if (sections[i].indexOf(sectionName) === 0) {
          body = sections[i].substring(sectionName.length).trim();
          break;
        }
      }

      // Remove trailing --- separators
      body = body.replace(/\\n---\\s*$/, '').trim();

      var result = { raw: body };

      // Extract **Subject:**
      var m1 = body.match(/\\*\\*Subject:\\*\\*\\s*(.+)/);
      if (m1) { result.subject = m1[1].trim(); body = body.replace(m1[0], ''); }

      // Extract **Preheader:**
      var m2 = body.match(/\\*\\*Preheader:\\*\\*\\s*(.+)/);
      if (m2) { result.preheader = m2[1].trim(); body = body.replace(m2[0], ''); }

      // Extract **Title:**
      var m3 = body.match(/\\*\\*Title:\\*\\*\\s*(.+)/);
      if (m3) { result.title = m3[1].trim(); body = body.replace(m3[0], ''); }

      // Extract **Body:** (for in-app)
      var m4 = body.match(/\\*\\*Body:\\*\\*\\s*(.+)/);
      if (m4) { result.bodyText = m4[1].trim(); body = body.replace(m4[0], ''); }

      // Extract **CTA:**
      var m5 = body.match(/\\*\\*CTA:\\*\\*\\s*(.+)/);
      if (m5) { result.cta = m5[1].trim(); body = body.replace(m5[0], ''); }

      // Extract **[CTA Text]**
      var m6 = body.match(/\\*\\*\\[(.+?)\\]\\*\\*/);
      if (m6) { result.ctaBtn = m6[1].trim(); }

      result.body = body.trim();
      return result;
    }

    // ---- Channel renderers ----
    function renderEmailPreview(msg, parsed) {
      var subject = (parsed && parsed.subject) || msg.subject || '(Subject not generated)';
      var preheader = (parsed && parsed.preheader) || msg.preheader || '';
      var bodyHtml = parsed ? '<p>' + md(parsed.body) + '</p>' : '';

      if (!parsed) {
        bodyHtml = '<div class="no-content-notice">Message copy not yet generated.<br><br><span style="font-size:0.8rem">Run the <strong>generate-messages</strong> skill to create copy.</span></div>';
        if (msg.comments) bodyHtml += '<p style="margin-top:16px;color:#6b7280;font-size:0.85rem"><strong>Notes:</strong> ' + esc(msg.comments) + '</p>';
      }

      return '<div class="email-frame">' +
        '<div class="email-toolbar"><div class="email-dot" style="background:#ff5f57"></div><div class="email-dot" style="background:#ffbd2e"></div><div class="email-dot" style="background:#28c840"></div></div>' +
        '<div class="email-header">' +
          '<div><span class="email-label">From:</span> ' + esc(msg.from) + '</div>' +
          '<div><span class="email-label">To:</span> {{first_name}} &lt;user@example.com&gt;</div>' +
          '<div><span class="email-label">Subject:</span> <span class="email-subject-line">' + md(subject) + '</span></div>' +
        '</div>' +
        (preheader ? '<div class="email-preheader">' + md(preheader) + '</div>' : '') +
        '<div class="email-body">' + bodyHtml + '</div>' +
      '</div>';
    }

    function renderInAppPreview(msg, parsed) {
      var title = (parsed && parsed.title) || msg.name || 'Notification';
      var body = (parsed && (parsed.bodyText || parsed.body)) || '';
      var cta = (parsed && parsed.cta) || msg.cta.text || 'OK';

      var inner;
      if (!parsed) {
        inner = '<div class="no-content-notice" style="margin:0;border:none;background:transparent">Message copy not yet generated.</div>';
        if (msg.comments) inner += '<p style="color:#6b7280;font-size:0.85rem">' + esc(msg.comments) + '</p>';
      } else {
        inner = '<div class="inapp-body">' + md(body) + '</div>';
      }

      return '<div class="inapp-backdrop">' +
        '<div class="inapp-modal">' +
          '<button class="inapp-close">&times;</button>' +
          '<div class="inapp-title">' + md(title) + '</div>' +
          inner +
          '<span class="preview-cta" style="background:#8b5cf6;display:block;text-align:center;border-radius:10px">' + esc(cta) + '</span>' +
        '</div>' +
      '</div>';
    }

    function renderSmsPreview(msg, parsed) {
      var body = (parsed && parsed.body) || '';

      var bubbleContent;
      if (!parsed) {
        bubbleContent = msg.comments ? esc(msg.comments) : '<em style="color:#8e8e93">Copy not yet generated</em>';
      } else {
        bubbleContent = md(body);
      }

      return '<div class="sms-phone">' +
        '<div class="sms-status-bar"><span>9:41</span><span>\\u2022\\u2022\\u2022\\u2022\\u2022</span></div>' +
        '<div class="sms-header">' + esc(msg.from || productName) + '</div>' +
        '<div class="sms-body">' +
          '<div class="sms-bubble">' + bubbleContent + '</div>' +
          '<div class="sms-time">Just now</div>' +
        '</div>' +
        '<div style="padding:8px 0"><div class="sms-home"></div></div>' +
      '</div>';
    }

    function renderPushPreview(msg, parsed) {
      var title = (parsed && parsed.title) || msg.name || 'Notification';
      var body = (parsed && (parsed.bodyText || parsed.body)) || '';
      var initial = productName.charAt(0).toUpperCase();

      var bodyHtml;
      if (!parsed) {
        bodyHtml = msg.comments ? '<div class="push-body-text">' + esc(msg.comments) + '</div>' : '<div class="push-body-text" style="color:#9ca3af"><em>Copy not yet generated</em></div>';
      } else {
        bodyHtml = '<div class="push-body-text">' + md(body).substring(0, 200) + '</div>';
      }

      return '<div class="push-phone">' +
        '<div class="push-status-bar"><span>9:41</span><span>\\u2022\\u2022\\u2022\\u2022\\u2022</span></div>' +
        '<div class="push-card">' +
          '<div class="push-icon">' + initial + '</div>' +
          '<div class="push-content">' +
            '<div class="push-app-name">' + esc(productName) + ' &middot; now</div>' +
            '<div class="push-title">' + md(title) + '</div>' +
            bodyHtml +
          '</div>' +
        '</div>' +
      '</div>';
    }

    // ---- Details card ----
    function renderDetails(msg) {
      var guards = msg.guards && msg.guards.length ? msg.guards.map(function(g) { return esc(g.condition); }).join('; ') : '\\u2014';
      var supps = msg.suppressions && msg.suppressions.length ? msg.suppressions.map(function(s) { return esc(s.condition); }).join('; ') : '\\u2014';
      var tags = msg.tags && msg.tags.length ? msg.tags.map(function(t) { return '<span style="display:inline-block;padding:1px 6px;border-radius:9999px;font-size:0.7rem;background:#e5e7eb;color:#374151;margin:1px">' + esc(t) + '</span>'; }).join(' ') : '\\u2014';

      return '<div class="details-card">' +
        '<h3>Message Details</h3>' +
        '<div class="details-grid">' +
          '<div><span class="detail-label">Trigger:</span></div><div class="detail-value">' + esc(msg.trigger.event) + ' (' + esc(msg.trigger.type) + ')</div>' +
          '<div><span class="detail-label">Wait:</span></div><div class="detail-value">' + esc(msg.wait) + '</div>' +
          '<div><span class="detail-label">Segment:</span></div><div class="detail-value">' + esc(msg.segment) + '</div>' +
          '<div><span class="detail-label">Format:</span></div><div class="detail-value">' + esc(msg.format) + '</div>' +
          '<div><span class="detail-label">Guards:</span></div><div class="detail-value">' + guards + '</div>' +
          '<div><span class="detail-label">Suppressions:</span></div><div class="detail-value">' + supps + '</div>' +
          '<div><span class="detail-label">Goal:</span></div><div class="detail-value detail-full">' + esc(msg.goal) + '</div>' +
          (msg.comments ? '<div><span class="detail-label">Comments:</span></div><div class="detail-value detail-full">' + esc(msg.comments) + '</div>' : '') +
          '<div><span class="detail-label">Tags:</span></div><div class="detail-value">' + tags + '</div>' +
        '</div>' +
      '</div>';
    }

    // ---- Main render ----
    var currentIdx = -1;

    function renderMessage(id) {
      var msg = messages.find(function(m) { return m.id === id; });
      if (!msg) return;

      currentIdx = messages.indexOf(msg);
      var channel = getMsgChannel(msg);
      var raw = messageContent[id] || null;
      var parsed = parseContent(raw, channel);

      // Channel label
      var chClass = channel.replace(/[^a-z]/g, '-');
      var channelBadge = '<span class="channel-label ' + chClass + '">' + esc(channel) + '</span>';

      // Stage badge
      var meta = stageMeta[msg.stage] || { label: msg.stage, color: '#666', bg: '#f0f0f0' };
      var stageBadge = '<span class="stage-badge" style="background:' + meta.bg + ';color:' + meta.color + '">' + esc(meta.label) + '</span>';

      // Message name header
      var header = '<div style="margin-bottom:8px;display:flex;align-items:center;gap:8px">' +
        stageBadge + channelBadge +
        '<span style="font-family:monospace;font-size:0.8rem;color:#9ca3af">' + esc(msg.id) + '</span>' +
        '</div>' +
        '<h2 style="font-size:1.25rem;font-weight:700;margin:0 0 20px">' + esc(msg.name) + '</h2>';

      // Channel-specific preview
      var preview;
      switch (channel) {
        case 'email': preview = renderEmailPreview(msg, parsed); break;
        case 'in-app': preview = renderInAppPreview(msg, parsed); break;
        case 'sms': preview = renderSmsPreview(msg, parsed); break;
        case 'push': preview = renderPushPreview(msg, parsed); break;
        default: preview = renderEmailPreview(msg, parsed);
      }

      // Prev / next nav
      var prevId = currentIdx > 0 ? messages[currentIdx - 1].id : null;
      var nextId = currentIdx < messages.length - 1 ? messages[currentIdx + 1].id : null;
      var nav = '<div class="nav-bar">' +
        (prevId ? '<a href="#' + prevId + '" class="nav-btn">&larr; ' + esc(prevId) + '</a>' : '<span></span>') +
        (nextId ? '<a href="#' + nextId + '" class="nav-btn">' + esc(nextId) + ' &rarr;</a>' : '<span></span>') +
        '</div>';

      var wrapper = document.getElementById('preview-wrapper');
      wrapper.innerHTML = header + preview + renderDetails(msg) + nav;
      wrapper.style.display = 'block';
      document.getElementById('empty-state').style.display = 'none';

      // Update sidebar active state
      document.querySelectorAll('.msg-link.active').forEach(function(el) { el.classList.remove('active'); });
      var sbItem = document.getElementById('sb-' + id);
      if (sbItem) { sbItem.classList.add('active'); sbItem.scrollIntoView({ block: 'nearest' }); }
    }

    // ---- Hash routing ----
    function onHashChange() {
      var id = location.hash.slice(1);
      if (id) renderMessage(decodeURIComponent(id));
    }
    window.addEventListener('hashchange', onHashChange);

    // ---- Keyboard nav ----
    document.addEventListener('keydown', function(e) {
      if (currentIdx < 0) return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        if (currentIdx < messages.length - 1) location.hash = '#' + messages[currentIdx + 1].id;
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        if (currentIdx > 0) location.hash = '#' + messages[currentIdx - 1].id;
      }
    });

    // ---- Initial load ----
    if (location.hash) onHashChange();
  </script>

  <footer style="text-align:center;padding:24px;font-size:0.8rem;color:#9ca3af;border-top:1px solid #e5e7eb">
    <a href="https://github.com/sr-kai/mango-lollipop" style="color:#6b7280;text-decoration:none;font-weight:600">Mango Lollipop</a> &mdash; AI-powered lifecycle messaging for SaaS<br>
    Made by Sasha Kai with probably too much coffee.
  </footer>
</body>
</html>`;
}
