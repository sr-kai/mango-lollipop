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
    for (const ch of m.channels) {
      byChannel[ch] = (byChannel[ch] ?? 0) + 1;
    }
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
  mermaidDiagram: string,
  analysis: Analysis
): string {
  const stats = buildStatsBlock(messages);
  const dataJson = JSON.stringify(messages);
  const analysisJson = JSON.stringify(analysis);
  const mermaidEscaped = escapeHtml(mermaidDiagram);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(analysis.company.name)} - Lifecycle Messaging Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    .stage-badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .tag-pill { display: inline-block; padding: 1px 6px; border-radius: 9999px; font-size: 0.7rem; background: #e5e7eb; color: #374151; cursor: pointer; margin: 1px; }
    .tag-pill.active { background: #3b82f6; color: white; }
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
    <!-- Sidebar: Tags -->
    <aside class="w-56 bg-white border-r p-4 min-h-screen">
      <h3 class="text-sm font-semibold text-gray-500 uppercase mb-2">Filter by Tag</h3>
      <div id="tag-sidebar">
${stats.allTags
  .map(
    (tag) =>
      `        <span class="tag-pill" data-tag="${escapeHtml(tag)}" onclick="toggleTag(this)">${escapeHtml(tag)} <span class="text-gray-400">(${stats.tagCounts[tag]})</span></span>`
  )
  .join("\n")}
      </div>
      <button class="mt-3 text-xs text-blue-500 hover:underline" onclick="clearTags()">Clear filters</button>

      <h3 class="text-sm font-semibold text-gray-500 uppercase mt-6 mb-2">Stats</h3>
      <div class="space-y-1 text-sm">
${Object.entries(stats.byStage)
  .map(([stage, count]) => {
    const meta = STAGE_META[stage as AARRRStage | "TX"] ?? {
      label: stage,
      color: "#666",
      bg: "#f0f0f0",
    };
    return `        <div class="flex justify-between"><span class="stage-badge" style="background:${meta.bg};color:${meta.color}">${meta.label}</span><span>${count}</span></div>`;
  })
  .join("\n")}
      </div>

      <h3 class="text-sm font-semibold text-gray-500 uppercase mt-6 mb-2">Channels</h3>
      <div class="space-y-1 text-sm">
${Object.entries(stats.byChannel)
  .map(
    ([ch, count]) =>
      `        <div class="flex justify-between"><span>${escapeHtml(ch)}</span><span>${count}</span></div>`
  )
  .join("\n")}
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-6 space-y-8">

      <!-- Journey Map -->
      <section>
        <h2 class="text-lg font-semibold mb-3">Customer Journey Map</h2>
        <div class="bg-white rounded-lg border p-4 overflow-x-auto">
          <pre class="mermaid">${mermaidEscaped}</pre>
        </div>
      </section>

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
                <th class="px-3 py-2">Channels</th>
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
    mermaid.initialize({ startOnLoad: true, theme: 'default' });

    const allMessages = JSON.parse(document.getElementById('msg-data').textContent);
    let currentView = 'all';
    let activeTags = new Set();
    let sortCol = 'id';
    let sortAsc = true;

    const stageMeta = ${JSON.stringify(STAGE_META)};

    function setView(view) {
      currentView = view;
      document.getElementById('btn-all').classList.toggle('bg-blue-100', view === 'all');
      document.getElementById('btn-tx').classList.toggle('bg-blue-100', view === 'tx');
      document.getElementById('btn-lc').classList.toggle('bg-blue-100', view === 'lc');
      render();
    }

    function toggleTag(el) {
      const tag = el.dataset.tag;
      if (activeTags.has(tag)) { activeTags.delete(tag); el.classList.remove('active'); }
      else { activeTags.add(tag); el.classList.add('active'); }
      render();
    }

    function clearTags() {
      activeTags.clear();
      document.querySelectorAll('.tag-pill').forEach(el => el.classList.remove('active'));
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

    function render() {
      let msgs = allMessages;
      if (currentView === 'tx') msgs = msgs.filter(m => m.classification === 'transactional');
      if (currentView === 'lc') msgs = msgs.filter(m => m.classification === 'lifecycle');
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
        const tr = document.createElement('tr');
        tr.className = 'msg-row border-t';
        tr.innerHTML =
          '<td class="px-3 py-2 font-mono text-xs">' + esc(m.id) + '</td>' +
          '<td class="px-3 py-2"><span class="stage-badge" style="background:' + meta.bg + ';color:' + meta.color + '">' + esc(meta.label) + '</span></td>' +
          '<td class="px-3 py-2 font-medium">' + esc(m.name) + '</td>' +
          '<td class="px-3 py-2 text-xs text-gray-600">' + esc(m.trigger.event) + '</td>' +
          '<td class="px-3 py-2 font-mono text-xs">' + esc(m.wait) + '</td>' +
          '<td class="px-3 py-2 text-xs">' + m.channels.map(c => esc(c)).join(', ') + '</td>' +
          '<td class="px-3 py-2 text-xs">' + esc(m.cta.text) + '</td>' +
          '<td class="px-3 py-2">' + m.tags.map(t => '<span class="tag-pill">' + esc(t) + '</span>').join(' ') + '</td>';
        tr.addEventListener('click', () => toggleDetail(m.id));
        tbody.appendChild(tr);

        // Detail row (hidden by default)
        const detail = document.createElement('tr');
        detail.id = 'detail-' + m.id;
        detail.className = 'msg-detail bg-gray-50';
        detail.innerHTML =
          '<td colspan="8" class="px-6 py-4 text-sm">' +
          '<div class="grid grid-cols-2 gap-4">' +
          '<div><strong>Subject:</strong> ' + esc(m.subject) + '</div>' +
          '<div><strong>From:</strong> ' + esc(m.from) + '</div>' +
          '<div><strong>Segment:</strong> ' + esc(m.segment) + '</div>' +
          '<div><strong>Goal:</strong> ' + esc(m.goal) + '</div>' +
          '<div><strong>Format:</strong> ' + esc(m.format) + '</div>' +
          '<div><strong>Guards:</strong> ' + (m.guards.length ? m.guards.map(g => esc(g.condition)).join('; ') : '\\u2014') + '</div>' +
          '<div><strong>Suppressions:</strong> ' + (m.suppressions.length ? m.suppressions.map(s => esc(s.condition)).join('; ') : '\\u2014') + '</div>' +
          '</div>' +
          '<div class="mt-3"><strong>Body:</strong><pre class="mt-1 p-3 bg-white border rounded text-xs whitespace-pre-wrap">' + esc(m.body) + '</pre></div>' +
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
</body>
</html>`;
}

// -----------------------------------------------------------------------------
// Overview HTML (clean, printable)
// -----------------------------------------------------------------------------

export function generateOverview(
  messages: Message[],
  mermaidDiagram: string,
  analysis: Analysis
): string {
  const stats = buildStatsBlock(messages);
  const stages: (AARRRStage | "TX")[] = ["TX", "AQ", "AC", "RV", "RT", "RF"];
  const mermaidEscaped = escapeHtml(mermaidDiagram);

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
        <td class="px-3 py-1 text-xs">${m.channels.map((c) => escapeHtml(c)).join(", ")}</td>
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
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
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

  <!-- Journey Map -->
  <section class="mb-8">
    <h2 class="text-lg font-semibold mb-2">Customer Journey Map</h2>
    <div class="border rounded p-4 overflow-x-auto">
      <pre class="mermaid">${mermaidEscaped}</pre>
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
          <th class="px-3 py-2 text-left">Channels</th>
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

  <script>mermaid.initialize({ startOnLoad: true, theme: 'default' });</script>
</body>
</html>`;
}
