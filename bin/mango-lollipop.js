#!/usr/bin/env node

import { Command } from 'commander';
import { execSync } from 'child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import open from 'open';

const __dirname = dirname(fileURLToPath(import.meta.url));

const program = new Command();

const STAGES = ['TX', 'AQ', 'AC', 'RV', 'RT', 'RF'];

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Search for a project file by name, checking common locations:
 * 1. Current directory
 * 2. output/ subdirectories
 */
function findProjectFile(filename) {
  // Check current directory
  const cwd = process.cwd();
  const direct = join(cwd, filename);
  if (existsSync(direct)) return direct;

  // Check output/ subdirectories
  const outputDir = join(cwd, 'output');
  if (existsSync(outputDir)) {
    try {
      const projects = readdirSync(outputDir, { withFileTypes: true });
      for (const entry of projects) {
        if (entry.isDirectory()) {
          const candidate = join(outputDir, entry.name, filename);
          if (existsSync(candidate)) return candidate;
        }
      }
    } catch {
      // ignore read errors
    }
  }

  return null;
}

/**
 * Find the project directory containing the given file.
 */
function findProjectDir(filename) {
  const filePath = findProjectFile(filename);
  if (!filePath) return null;
  return dirname(filePath);
}

/**
 * Load and parse a mango-lollipop.json config file.
 * Searches current directory and output/ subdirectories.
 */
function loadConfig() {
  const configPath = findProjectFile('mango-lollipop.json');
  if (!configPath) {
    console.log('No mango-lollipop.json found. Run `mango-lollipop init <name>` first.');
    return null;
  }
  try {
    const raw = readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.log(`Error reading config: ${err.message}`);
    return null;
  }
}

/**
 * Group an array of objects by a key.
 */
function groupBy(arr, key) {
  const result = {};
  for (const item of arr) {
    const val = item[key];
    if (!result[val]) result[val] = [];
    result[val].push(item);
  }
  return result;
}

/**
 * Count occurrences of each value in an array.
 */
function countBy(arr) {
  const result = {};
  for (const item of arr) {
    result[item] = (result[item] || 0) + 1;
  }
  return result;
}

// -----------------------------------------------------------------------------
// CLI Program
// -----------------------------------------------------------------------------

program
  .name('mango-lollipop')
  .description('AI-powered lifecycle messaging generator')
  .version(JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')).version);

// --- init -------------------------------------------------------------------

program
  .command('init [name]')
  .description('Initialize a new Mango Lollipop project')
  .action((name = 'my-project') => {
    const dir = resolve(name);
    mkdirSync(dir, { recursive: true });

    // Create message folders per stage
    for (const stage of STAGES) {
      mkdirSync(`${dir}/messages/${stage}`, { recursive: true });
    }

    // Copy skills, templates, and Claude Code commands from the package
    const pkgRoot = resolve(__dirname, '..');
    const toCopy = [
      ['templates', 'templates'],
      ['.claude/skills', '.claude/skills'],
      ['CLAUDE.md', 'CLAUDE.md'],
    ];

    for (const [src, dest] of toCopy) {
      const srcPath = join(pkgRoot, src);
      const destPath = join(dir, dest);
      if (existsSync(srcPath)) {
        cpSync(srcPath, destPath, { recursive: true });
      }
    }

    // Create initial config
    const config = {
      name,
      version: '0.1.0',
      created: new Date().toISOString(),
      stage: 'initialized',
      path: null,
      channels: [],
      analysis: null,
      matrix: null,
    };

    writeFileSync(`${dir}/mango-lollipop.json`, JSON.stringify(config, null, 2));

    console.log(`Mango Lollipop project "${name}" initialized at ${dir}`);
    console.log();
    console.log('Next step:');
    console.log(`  cd ${name}`);
    console.log('  /start');
  });

// --- generate ---------------------------------------------------------------

program
  .command('generate')
  .description('Generate the full lifecycle messaging system')
  .action(() => {
    const config = loadConfig();
    if (!config) return;

    if (!config.analysis) {
      console.log('No analysis found. Run the start skill first:');
      console.log('  claude "Read the start skill and help me set up lifecycle messaging"');
      return;
    }

    console.log(`Generating lifecycle messaging for "${config.name}"...`);
    console.log();
    console.log('Run these skills in Claude Code in order:');
    console.log();
    console.log('  1. Generate matrix:');
    console.log('     claude "Read the generate-matrix skill and build the lifecycle matrix"');
    console.log();
    console.log('  2. Generate message copy:');
    console.log('     claude "Read the generate-messages skill and write all message copy"');
    console.log();
    console.log('  3. Generate visuals:');
    console.log('     claude "Read the generate-dashboard skill and create the dashboard and journey map"');
  });

// --- audit ------------------------------------------------------------------

program
  .command('audit')
  .description('Audit existing lifecycle messaging')
  .action(() => {
    console.log('Starting lifecycle messaging audit...');
    console.log();
    console.log('Run the audit skill in Claude Code:');
    console.log('  claude "Read the audit skill and help me audit my existing lifecycle messaging"');
    console.log();
    console.log('Have your existing messages ready to paste or upload.');
  });

// --- view -------------------------------------------------------------------

program
  .command('view')
  .description('Open the visual dashboard in your browser')
  .action(async () => {
    const dashboard = findProjectFile('dashboard.html');
    if (dashboard) {
      console.log(`Opening dashboard: ${dashboard}`);
      await open(dashboard);
    } else {
      console.log('No dashboard found. Run `mango-lollipop generate` first.');
    }
  });

// --- export -----------------------------------------------------------------

program
  .command('export <type>')
  .description('Generate outputs from project data (excel, html, messages)')
  .option('-p, --project <dir>', 'Project directory (auto-detected if omitted)')
  .action(async (type, opts) => {
    const projectDir = opts.project || findProjectDir('matrix.json');
    if (!projectDir) {
      console.log('No matrix.json found. Run the generate-matrix skill first.');
      return;
    }

    switch (type) {
      case 'excel': {
        const matrixPath = join(projectDir, 'matrix.json');
        const analysisPath = join(projectDir, 'analysis.json');

        if (!existsSync(matrixPath)) {
          console.log(`No matrix.json in ${projectDir}. Run the generate-matrix skill first.`);
          return;
        }
        if (!existsSync(analysisPath)) {
          console.log(`No analysis.json in ${projectDir}. Run the start skill first.`);
          return;
        }

        const matrix = JSON.parse(readFileSync(matrixPath, 'utf-8'));
        const analysis = JSON.parse(readFileSync(analysisPath, 'utf-8'));

        // Flatten tag definitions from analysis
        const allTags = [
          ...(analysis.tags?.sources || []),
          ...(analysis.tags?.plans || []).map(p => `plan:${p}`),
          ...(analysis.tags?.segments || []).map(s => `segment:${s}`),
          ...(analysis.tags?.features || []).map(f => `feature:${f}`),
        ];

        const { generateMatrixWorkbook, writeWorkbook } = await import(
          resolve(__dirname, '..', 'dist', 'excel.js')
        );

        const wb = generateMatrixWorkbook(matrix.messages, analysis.events, allTags, analysis);
        const outPath = join(projectDir, 'matrix.xlsx');
        writeWorkbook(wb, outPath);

        console.log(`Excel written: ${outPath}`);
        console.log(`${matrix.messages.length} messages across 6 sheets (Welcome + 5 data sheets)`);
        break;
      }
      case 'html':
      case 'visuals': {
        const vMatrixPath = join(projectDir, 'matrix.json');
        const vAnalysisPath = join(projectDir, 'analysis.json');

        if (!existsSync(vMatrixPath)) {
          console.log(`No matrix.json in ${projectDir}. Run the generate-matrix skill first.`);
          return;
        }
        if (!existsSync(vAnalysisPath)) {
          console.log(`No analysis.json in ${projectDir}. Run the start skill first.`);
          return;
        }

        const vMatrix = JSON.parse(readFileSync(vMatrixPath, 'utf-8'));
        const vAnalysis = JSON.parse(readFileSync(vAnalysisPath, 'utf-8'));

        const { generateDashboard, generateOverview, generateMessageViewer } = await import(
          resolve(__dirname, '..', 'dist', 'html.js')
        );

        // 1. Dashboard
        const dashboardHtml = generateDashboard(vMatrix.messages, vAnalysis);
        const dashboardPath = join(projectDir, 'dashboard.html');
        writeFileSync(dashboardPath, dashboardHtml);
        console.log(`Dashboard written:   ${dashboardPath}`);

        // 2. Overview
        const overviewHtml = generateOverview(vMatrix.messages, vAnalysis);
        const overviewPath = join(projectDir, 'overview.html');
        writeFileSync(overviewPath, overviewHtml);
        console.log(`Overview written:    ${overviewPath}`);

        // 3. Message viewer — read message files if they exist
        const msgContentMap = {};
        const messagesDir = join(projectDir, 'messages');
        if (existsSync(messagesDir)) {
          for (const stage of ['TX', 'AQ', 'AC', 'RV', 'RT', 'RF']) {
            const stageDir = join(messagesDir, stage);
            if (existsSync(stageDir)) {
              const files = readdirSync(stageDir).filter(f => f.endsWith('.md'));
              for (const file of files) {
                const raw = readFileSync(join(stageDir, file), 'utf-8');
                const idMatch = file.match(/^([A-Z]+-\d+)/);
                if (idMatch) {
                  // Strip YAML frontmatter, keep body only
                  const bodyMatch = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
                  msgContentMap[idMatch[1]] = bodyMatch ? bodyMatch[1].trim() : raw;
                }
              }
            }
          }
        }

        const viewerHtml = generateMessageViewer(vMatrix.messages, vAnalysis, msgContentMap);
        const viewerPath = join(projectDir, 'messages.html');
        writeFileSync(viewerPath, viewerHtml);
        console.log(`Message viewer:     ${viewerPath}`);

        console.log(`\n3 visual outputs generated from ${vMatrix.messages.length} messages.`);
        break;
      }
      case 'messages':
        console.log('Run in Claude Code:');
        console.log('  claude "Read the generate-messages skill and regenerate all message files"');
        break;
      default:
        console.log(`Unknown export type: "${type}"`);
        console.log('Valid types: excel, html, messages');
    }
  });

// --- status -----------------------------------------------------------------

program
  .command('status')
  .description('Show project status')
  .action(() => {
    const config = loadConfig();
    if (!config) return;

    console.log(`Mango Lollipop Project: ${config.name}`);
    console.log(`   Path: ${config.path || 'not set'}`);
    console.log(`   Stage: ${config.stage}`);
    console.log(`   Channels: ${config.channels.length > 0 ? config.channels.join(', ') : 'not set'}`);

    if (config.matrix && config.matrix.messages) {
      const msgs = config.matrix.messages;

      const tx = msgs.filter(m => m.classification === 'transactional');
      const lc = msgs.filter(m => m.classification === 'lifecycle');
      console.log();
      console.log(`   Transactional: ${tx.length} messages`);
      console.log(`   Lifecycle: ${lc.length} messages`);

      const stages = groupBy(msgs, 'stage');
      console.log();
      console.log('   By stage:');
      for (const stage of STAGES) {
        if (stages[stage]) {
          console.log(`     ${stage}: ${stages[stage].length} messages`);
        }
      }

      const channels = msgs.flatMap(m => m.channels || []);
      const channelCounts = countBy(channels);
      console.log();
      console.log('   By channel:');
      for (const [channel, count] of Object.entries(channelCounts)) {
        console.log(`     ${channel}: ${count} uses`);
      }

      const tags = msgs.flatMap(m => m.tags || []);
      const tagCounts = countBy(tags);
      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      if (topTags.length) {
        console.log();
        console.log('   Top tags:');
        for (const [tag, count] of topTags) {
          console.log(`     ${tag}: ${count}`);
        }
      }
    } else {
      console.log();
      console.log('   No matrix generated yet. Run `mango-lollipop generate` to create one.');
    }
  });

// --- update -----------------------------------------------------------------

program
  .command('update')
  .description('Update mango-lollipop to the latest version')
  .action(() => {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
    const current = pkg.version;

    let latest;
    try {
      latest = execSync('npm view mango-lollipop@latest version', { encoding: 'utf-8' }).trim();
    } catch {
      console.log('Could not reach the npm registry. Check your internet connection.');
      return;
    }

    if (current === latest) {
      console.log(`Already on the latest version (${current}).`);
      return;
    }

    console.log(`Current version: ${current}`);
    console.log(`Latest version:  ${latest}`);
    console.log();
    console.log('Updating...');

    try {
      execSync('npm install -g mango-lollipop@latest', { stdio: 'inherit' });
      console.log();
      console.log(`Updated to ${latest}.`);
    } catch {
      console.log('Update failed. Try running manually:');
      console.log('  npm install -g mango-lollipop@latest');
    }
  });

// --- parse ------------------------------------------------------------------

program.parse();
