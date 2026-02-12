#!/usr/bin/env node

import { Command } from 'commander';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import open from 'open';

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
  .version('0.1.0');

// --- init -------------------------------------------------------------------

program
  .command('init [name]')
  .description('Initialize a new Mango Lollipop project')
  .action((name = 'my-project') => {
    const dir = resolve(`output/${name}`);
    mkdirSync(dir, { recursive: true });

    // Create message folders per stage
    for (const stage of STAGES) {
      mkdirSync(`${dir}/messages/${stage}`, { recursive: true });
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
    console.log('Next step: Run the analyze skill in Claude Code:');
    console.log(`  cd ${dir}`);
    console.log('  claude "Read the analyze skill and help me set up lifecycle messaging"');
  });

// --- generate ---------------------------------------------------------------

program
  .command('generate')
  .description('Generate the full lifecycle messaging system')
  .action(() => {
    const config = loadConfig();
    if (!config) return;

    if (!config.analysis) {
      console.log('No analysis found. Run the analyze skill first:');
      console.log('  claude "Read the analyze skill and help me set up lifecycle messaging"');
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
    console.log('     claude "Read the generate-visuals skill and create the dashboard and journey map"');
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
  .description('Regenerate specific outputs (excel, html, messages)')
  .action((type) => {
    const config = loadConfig();
    if (!config) return;

    if (!config.matrix) {
      console.log('No matrix found. Run `mango-lollipop generate` first.');
      return;
    }

    switch (type) {
      case 'excel':
        console.log('Regenerating matrix.xlsx...');
        console.log();
        console.log('Run in Claude Code:');
        console.log('  claude "Read the generate-matrix skill and regenerate the Excel export"');
        break;
      case 'html':
        console.log('Regenerating dashboard.html and overview.html...');
        console.log();
        console.log('Run in Claude Code:');
        console.log('  claude "Read the generate-visuals skill and regenerate the HTML outputs"');
        break;
      case 'messages':
        console.log('Regenerating message files...');
        console.log();
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

// --- parse ------------------------------------------------------------------

program.parse();
