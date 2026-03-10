#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const {
  API_BASE_URL,
  DEFAULT_MIN_INTERVAL_MS,
  LiquipediaApiClient,
} = require('../../liquipedia_pre2014_stage1/src/liquipedia_api');
const {
  cleanWikitextValue,
} = require('../../liquipedia_pre2014_stage1/src/wikitext_parser');

const STAGE_ROOT = path.resolve(__dirname, '..');
const DEFAULT_DATA_DIR = path.join(STAGE_ROOT, 'data');
const DEFAULT_CACHE_DIR = path.join(STAGE_ROOT, 'cache', 'http');
const DEFAULT_JSON_PATH = path.join(DEFAULT_DATA_DIR, 'pre2014_ticketless_players.json');
const DEFAULT_CSV_PATH = path.join(DEFAULT_DATA_DIR, 'pre2014_ticketless_players.csv');
const DEFAULT_MANUAL_OVERRIDES_PATH = path.join(DEFAULT_DATA_DIR, 'manual_player_overrides.json');
const DEFAULT_SCOPE_PATH = path.resolve(
  __dirname,
  '../../liquipedia_pre2014_stage1/data/pre2014_ticketless_candidates.json',
);
const DEFAULT_STAGE1_CACHE_DIR = path.resolve(
  __dirname,
  '../../liquipedia_pre2014_stage1/cache/http',
);
const DEFAULT_USER_AGENT =
  process.env.LIQUIPEDIA_USER_AGENT ||
  'dota-stats-archive-liquipedia-ticketless-players/1.0 (local workspace; contact: local)';
const STEAM64_BASE = 76561197960265728n;
const SUPPLEMENTAL_ONLY_TOURNAMENTS = new Set([
  'The International 2011',
  'Dota2 Star Championship',
]);

function chunk(array, size) {
  const chunks = [];

  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size));
  }

  return chunks;
}

function unique(values) {
  const seen = new Set();
  const results = [];

  for (const value of values) {
    if (!value) {
      continue;
    }

    const key = String(value);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    results.push(value);
  }

  return results;
}

function normalizeWikiTitle(value) {
  return cleanWikitextValue(value)
    .replace(/\s*<!--.*$/g, ' ')
    .replace(/\s*<ref\b.*$/gi, ' ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeNameKey(value) {
  return normalizeWikiTitle(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildLiquipediaUrl(title) {
  const encodedTitle = title
    .split('/')
    .map((segment) => encodeURIComponent(segment.replace(/ /g, '_')))
    .join('/');

  return `https://liquipedia.net/dota2/${encodedTitle}`;
}

function csvEscape(value) {
  const stringValue = value === null || value === undefined ? '' : String(value);

  if (!/[,"\n]/.test(stringValue)) {
    return stringValue;
  }

  return `"${stringValue.replace(/"/g, '""')}"`;
}

function writeCsv(filePath, rows) {
  const headers = [
    'canonical_handle',
    'canonical_handle_source',
    'liquipedia_page_title',
    'liquipedia_url',
    'resolution_status',
    'resolution_confidence',
    'account_ids',
    'steam_ids',
    'observed_names',
    'liquipedia_handles',
    'legal_names',
    'romanized_names',
    'tournament_count',
    'tournaments',
    'resolution_evidence',
    'scope_role',
    'primary_tournaments',
    'supplemental_tournaments',
  ];

  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return csvEscape(Array.isArray(value) ? value.join(' | ') : value);
        })
        .join(','),
    ),
  ];

  fs.writeFileSync(filePath, `${lines.join('\n')}\n`);
}

function parseArguments(argv) {
  const options = {
    batchSize: 25,
    cacheDir: DEFAULT_CACHE_DIR,
    csvPath: DEFAULT_CSV_PATH,
    jsonPath: DEFAULT_JSON_PATH,
    manualOverridesPath: DEFAULT_MANUAL_OVERRIDES_PATH,
    minIntervalMs: DEFAULT_MIN_INTERVAL_MS,
    refreshCache: false,
    scopePath: DEFAULT_SCOPE_PATH,
    stage1CacheDir: DEFAULT_STAGE1_CACHE_DIR,
    userAgent: DEFAULT_USER_AGENT,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const nextToken = argv[index + 1];

    switch (token) {
      case '--batch-size':
        options.batchSize = Number(nextToken);
        index += 1;
        break;
      case '--cache-dir':
        options.cacheDir = path.resolve(nextToken);
        index += 1;
        break;
      case '--csv':
        options.csvPath = path.resolve(nextToken);
        index += 1;
        break;
      case '--json':
        options.jsonPath = path.resolve(nextToken);
        index += 1;
        break;
      case '--manual-overrides':
        options.manualOverridesPath = path.resolve(nextToken);
        index += 1;
        break;
      case '--refresh-cache':
        options.refreshCache = true;
        break;
      case '--scope':
        options.scopePath = path.resolve(nextToken);
        index += 1;
        break;
      case '--stage1-cache-dir':
        options.stage1CacheDir = path.resolve(nextToken);
        index += 1;
        break;
      case '--user-agent':
        options.userAgent = nextToken;
        index += 1;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  if (!Number.isInteger(options.batchSize) || options.batchSize <= 0) {
    throw new Error('batch-size must be a positive integer');
  }

  return options;
}

function extractNamedTemplates(wikitext, templateName) {
  if (!wikitext) {
    return [];
  }

  const pattern = new RegExp(`\\{\\{\\s*${templateName}\\b`, 'gi');
  const templates = [];
  let match;

  while ((match = pattern.exec(wikitext))) {
    const startIndex = match.index;
    let depth = 0;
    let endIndex = null;

    for (let index = startIndex; index < wikitext.length - 1; index += 1) {
      const pair = wikitext.slice(index, index + 2);

      if (pair === '{{') {
        depth += 1;
        index += 1;
        continue;
      }

      if (pair === '}}') {
        depth -= 1;

        if (depth === 0) {
          endIndex = index + 2;
          break;
        }

        index += 1;
      }
    }

    if (endIndex === null) {
      continue;
    }

    templates.push(wikitext.slice(startIndex, endIndex));
    pattern.lastIndex = endIndex;
  }

  return templates;
}

function extractFirstNamedTemplate(wikitext, templateName) {
  return extractNamedTemplates(wikitext, templateName)[0] || null;
}

function splitTopLevelPipes(content) {
  const segments = [];
  let current = '';
  let braceDepth = 0;
  let bracketDepth = 0;

  for (let index = 0; index < content.length; index += 1) {
    const pair = content.slice(index, index + 2);

    if (pair === '{{') {
      braceDepth += 1;
      current += pair;
      index += 1;
      continue;
    }

    if (pair === '}}') {
      braceDepth = Math.max(0, braceDepth - 1);
      current += pair;
      index += 1;
      continue;
    }

    if (pair === '[[') {
      bracketDepth += 1;
      current += pair;
      index += 1;
      continue;
    }

    if (pair === ']]') {
      bracketDepth = Math.max(0, bracketDepth - 1);
      current += pair;
      index += 1;
      continue;
    }

    if (content[index] === '|' && braceDepth === 0 && bracketDepth === 0) {
      segments.push(current);
      current = '';
      continue;
    }

    current += content[index];
  }

  segments.push(current);
  return segments;
}

function parseTemplate(rawTemplate) {
  if (!rawTemplate) {
    return {
      params: {},
      rawTemplate: null,
      templateName: null,
    };
  }

  const trimmed = rawTemplate.trim();

  if (!trimmed.startsWith('{{') || !trimmed.endsWith('}}')) {
    return {
      params: {},
      rawTemplate,
      templateName: null,
    };
  }

  const inner = trimmed.slice(2, -2);
  const segments = splitTopLevelPipes(inner);
  const templateName = (segments.shift() || '').trim();
  const params = {};

  for (const segment of segments) {
    const separatorIndex = segment.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = segment.slice(0, separatorIndex).trim().toLowerCase();
    const value = segment.slice(separatorIndex + 1).trim();

    if (!key) {
      continue;
    }

    params[key] = value;
  }

  return {
    params,
    rawTemplate,
    templateName,
  };
}

function splitAliasField(rawValue) {
  if (!rawValue) {
    return [];
  }

  const cleaned = cleanWikitextValue(rawValue)
    .replace(/\s+\/\s+/g, '|')
    .replace(/\s+;\s+/g, '|')
    .replace(/\s*,\s*/g, '|');

  return unique(
    cleaned
      .split('|')
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function extractNumericValues(rawValue) {
  if (!rawValue) {
    return [];
  }

  const matches = String(rawValue).match(/\d+/g) || [];
  return unique(matches);
}

function mergeIdEntries(entries) {
  const byValue = new Map();

  for (const entry of entries) {
    if (!entry?.value) {
      continue;
    }

    const existing = byValue.get(entry.value);

    if (!existing) {
      byValue.set(entry.value, {
        confidence: entry.confidence || 'explicit',
        sources: unique(entry.sources || [entry.source].filter(Boolean)),
        value: entry.value,
      });
      continue;
    }

    existing.sources = unique(
      existing.sources.concat(entry.sources || [entry.source].filter(Boolean)),
    );

    if (existing.confidence !== 'explicit' && entry.confidence === 'explicit') {
      existing.confidence = 'explicit';
    }
  }

  return [...byValue.values()].sort((left, right) => {
    if (left.value.length !== right.value.length) {
      return left.value.length - right.value.length;
    }

    return left.value.localeCompare(right.value);
  });
}

function deriveSteamId64(accountId) {
  try {
    return (STEAM64_BASE + BigInt(accountId)).toString();
  } catch {
    return null;
  }
}

function collectInfoboxIdEntries(params) {
  const accountEntries = [];
  const steamEntries = [];

  for (const [key, rawValue] of Object.entries(params)) {
    const normalizedKey = key.toLowerCase();

    if (/^(?:playerid|accountid)(?:[_-]?\d+)?$/.test(normalizedKey)) {
      for (const value of extractNumericValues(rawValue)) {
        accountEntries.push({
          confidence: 'explicit',
          source: `liquipedia_player_infobox.${normalizedKey}`,
          value,
        });
      }
    }

    if (/^(?:steamid64|steamid)(?:[_-]?\d+)?$/.test(normalizedKey)) {
      for (const value of extractNumericValues(rawValue)) {
        steamEntries.push({
          confidence: 'explicit',
          source: `liquipedia_player_infobox.${normalizedKey}`,
          value,
        });
      }
    }
  }

  return {
    accountEntries,
    steamEntries,
  };
}

function parsePlayerPage(page) {
  const revision = page?.revisions?.[0];
  const wikitext = revision?.slots?.main?.content || null;
  const rawInfobox = extractFirstNamedTemplate(wikitext, 'Infobox player');

  if (!rawInfobox) {
    return null;
  }

  const infobox = parseTemplate(rawInfobox);
  const primaryHandle = normalizeWikiTitle(infobox.params.id || '');
  const alternateHandles = splitAliasField(infobox.params.ids || '');
  const legalNames = splitAliasField(infobox.params.name || '');
  const romanizedNames = splitAliasField(infobox.params.romanized_name || '');
  const { accountEntries, steamEntries } = collectInfoboxIdEntries(infobox.params);

  return {
    account_ids: mergeIdEntries(accountEntries),
    alternate_handles: alternateHandles,
    legal_names: legalNames,
    liquipedia_url: buildLiquipediaUrl(page.title),
    page_title: page.title,
    primary_handle: primaryHandle || null,
    romanized_names: romanizedNames,
    steam_ids: mergeIdEntries(steamEntries),
    template_name: infobox.templateName,
  };
}

function resolveRequestTitle(requestedTitle, normalizedMap, redirectMap) {
  let current = requestedTitle;
  const seen = new Set();

  while (current && !seen.has(current)) {
    seen.add(current);

    if (normalizedMap.has(current)) {
      current = normalizedMap.get(current);
      continue;
    }

    if (redirectMap.has(current)) {
      current = redirectMap.get(current);
      continue;
    }

    break;
  }

  return current;
}

function loadCachedPagesByTitle(cacheDir, titles) {
  const titleSet = new Set(titles);
  const pagesByTitle = new Map();

  if (!fs.existsSync(cacheDir)) {
    return pagesByTitle;
  }

  for (const fileName of fs.readdirSync(cacheDir)) {
    if (pagesByTitle.size === titleSet.size) {
      break;
    }

    const cachePath = path.join(cacheDir, fileName);
    let payload;

    try {
      payload = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch {
      continue;
    }

    const pages = payload?.data?.query?.pages;

    if (!Array.isArray(pages)) {
      continue;
    }

    for (const page of pages) {
      if (!titleSet.has(page.title) || pagesByTitle.has(page.title)) {
        continue;
      }

      const wikitext = page?.revisions?.[0]?.slots?.main?.content || null;

      if (!wikitext) {
        continue;
      }

      pagesByTitle.set(page.title, page);
    }
  }

  return pagesByTitle;
}

function isPlaceholderName(value) {
  const normalized = normalizeNameKey(value);
  return (
    !normalized ||
    normalized === 'tba' ||
    normalized === 'tbd' ||
    normalized === 'unknown' ||
    normalized === 'standin' ||
    normalized === 'stand in'
  );
}

function extractTournamentObservations(scopeCandidates, tournamentPagesByTitle) {
  const observations = [];

  for (const tournament of scopeCandidates) {
    const page = tournamentPagesByTitle.get(tournament.liquipedia_page_title);

    if (!page) {
      observations.push({
        observation_type: 'missing_tournament_page',
        tournament_page_title: tournament.liquipedia_page_title,
      });
      continue;
    }

    const wikitext = page?.revisions?.[0]?.slots?.main?.content || '';
    const teamCards = extractNamedTemplates(wikitext, 'TeamCard');

    for (const teamCard of teamCards) {
      const parsed = parseTemplate(teamCard);
      const teamName = normalizeWikiTitle(parsed.params.team || '') || null;

      for (let slot = 1; slot <= 10; slot += 1) {
        const nameKey = `p${slot}`;
        const linkKey = `p${slot}link`;
        const idKey = `p${slot}id`;
        const observedName = normalizeWikiTitle(parsed.params[nameKey] || '');

        if (!observedName || isPlaceholderName(observedName)) {
          continue;
        }

        observations.push({
          linked_player_page: normalizeWikiTitle(parsed.params[linkKey] || '') || null,
          observed_account_ids: extractNumericValues(parsed.params[idKey] || '').map((value) => ({
            confidence: 'explicit',
            source: `tournament_teamcard.${idKey}`,
            value,
          })),
          observed_name: observedName,
          player_lookup_source: parsed.params[linkKey] ? 'teamcard_link' : 'observed_name_exact_title',
          slot,
          source_page_title: tournament.liquipedia_page_title,
          source_template: 'TeamCard',
          team_name: teamName,
          tournament_end_date: tournament.end_date,
          tournament_page_title: tournament.liquipedia_page_title,
          tournament_start_date: tournament.start_date,
          tournament_title: tournament.canonical_title,
          tournament_url: tournament.liquipedia_url,
        });
      }
    }
  }

  return observations;
}

function collectPlayerLookupTitles(observations) {
  const titles = new Set();

  for (const observation of observations) {
    if (observation.observation_type === 'missing_tournament_page') {
      continue;
    }

    const requestedTitle = observation.linked_player_page || observation.observed_name;

    if (requestedTitle) {
      titles.add(requestedTitle);
    }
  }

  return [...titles].sort((left, right) => left.localeCompare(right));
}

async function fetchPlayerPages(client, requestedTitles, batchSize) {
  const requestedToPlayerPage = new Map();
  const parsedPlayerPages = new Map();

  for (const batch of chunk(requestedTitles, batchSize)) {
    const data = await client.request({
      prop: 'revisions',
      redirects: 1,
      rvprop: 'content',
      rvslots: 'main',
      titles: batch,
    });

    const normalizedMap = new Map(
      (data?.query?.normalized || []).map((entry) => [entry.from, entry.to]),
    );
    const redirectMap = new Map(
      (data?.query?.redirects || []).map((entry) => [entry.from, entry.to]),
    );
    const pageByTitle = new Map(
      (data?.query?.pages || [])
        .filter((page) => !page.missing)
        .map((page) => [page.title, page]),
    );

    for (const requestedTitle of batch) {
      const resolvedTitle = resolveRequestTitle(requestedTitle, normalizedMap, redirectMap);
      const page = pageByTitle.get(resolvedTitle);

      if (!page) {
        requestedToPlayerPage.set(requestedTitle, null);
        continue;
      }

      if (!parsedPlayerPages.has(page.title)) {
        parsedPlayerPages.set(page.title, parsePlayerPage(page));
      }

      const parsedPlayerPage = parsedPlayerPages.get(page.title);

      if (!parsedPlayerPage) {
        requestedToPlayerPage.set(requestedTitle, null);
        continue;
      }

      requestedToPlayerPage.set(requestedTitle, {
        ...parsedPlayerPage,
        lookup_title: requestedTitle,
        resolved_title: page.title,
      });
    }
  }

  return requestedToPlayerPage;
}

function buildGroupKey(observation) {
  if (observation.resolved_player_page?.page_title) {
    return `page:${observation.resolved_player_page.page_title}`;
  }

  const linkedKey = normalizeNameKey(observation.linked_player_page || '');

  if (linkedKey) {
    return `linked:${linkedKey}`;
  }

  const observedNameKey = normalizeNameKey(observation.observed_name);

  if (observedNameKey) {
    return `name:${observedNameKey}`;
  }

  const observedAccountId = observation.observed_account_ids?.[0]?.value;

  if (observedAccountId) {
    return `account:${observedAccountId}`;
  }

  return `fallback:${observation.tournament_page_title}:${observation.slot}`;
}

function describeObservationGroup(observations) {
  return {
    hasAccountId: observations.some(
      (observation) =>
        (observation.observed_account_ids || []).length > 0 ||
        (observation.resolved_player_page?.account_ids || []).length > 0,
    ),
    hasResolvedPage: observations.some(
      (observation) => Boolean(observation.resolved_player_page?.page_title),
    ),
    linkedHintKeys: unique(
      observations
        .map((observation) => normalizeNameKey(observation.linked_player_page || ''))
        .filter(Boolean),
    ),
    observedNameKeys: unique(
      observations
        .map((observation) => normalizeNameKey(observation.observed_name))
        .filter(Boolean),
    ),
  };
}

function mergeObservationGroups(groups) {
  const entries = [...groups.entries()].map(([key, observations]) => ({
    key,
    observations: [...observations],
  }));
  const metadataByKey = new Map(
    entries.map((entry) => [entry.key, describeObservationGroup(entry.observations)]),
  );
  const strongNameIndex = new Map();

  for (const entry of entries) {
    const metadata = metadataByKey.get(entry.key);

    if (!metadata.hasResolvedPage && !metadata.hasAccountId) {
      continue;
    }

    for (const nameKey of metadata.observedNameKeys) {
      const targets = strongNameIndex.get(nameKey) || new Set();
      targets.add(entry.key);
      strongNameIndex.set(nameKey, targets);
    }
  }

  const mergeTargets = new Map();

  for (const entry of entries) {
    const metadata = metadataByKey.get(entry.key);

    if (metadata.hasResolvedPage || metadata.hasAccountId) {
      continue;
    }

    if (metadata.linkedHintKeys.length > 0 || metadata.observedNameKeys.length !== 1) {
      continue;
    }

    const matches = [...(strongNameIndex.get(metadata.observedNameKeys[0]) || new Set())].filter(
      (key) => key !== entry.key,
    );

    if (matches.length === 1) {
      mergeTargets.set(entry.key, matches[0]);
    }
  }

  if (mergeTargets.size === 0) {
    return {
      groups,
      mergedGroupCount: 0,
    };
  }

  const mergedGroups = new Map();
  const mergedSourceKeys = new Set();

  for (const entry of entries) {
    const targetKey = mergeTargets.get(entry.key) || entry.key;
    const mergedObservations = mergedGroups.get(targetKey) || [];
    mergedObservations.push(...entry.observations);
    mergedGroups.set(targetKey, mergedObservations);

    if (targetKey !== entry.key) {
      mergedSourceKeys.add(entry.key);
    }
  }

  return {
    groups: mergedGroups,
    mergedGroupCount: mergedSourceKeys.size,
  };
}

function loadManualOverrides(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return new Map();
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const players = raw.players || raw;
  const overrides = new Map();

  for (const [canonicalHandle, override] of Object.entries(players)) {
    if (!canonicalHandle || !override || typeof override !== 'object') {
      continue;
    }

    overrides.set(canonicalHandle, override);
  }

  return overrides;
}

function buildManualIdEntries(override, canonicalHandle) {
  return (override.account_ids || []).map((entry) => {
    if (typeof entry === 'string' || typeof entry === 'number') {
      return {
        confidence: 'explicit',
        source: `manual_override.${canonicalHandle}`,
        value: String(entry),
      };
    }

    return {
      confidence: entry.confidence || 'explicit',
      sources: unique(
        (entry.sources || [entry.source].filter(Boolean)).concat(`manual_override.${canonicalHandle}`),
      ),
      value: String(entry.value || ''),
    };
  });
}

function applyManualOverrides(players, overrides) {
  let appliedCount = 0;

  for (const player of players) {
    const override = overrides.get(player.canonical_handle);

    if (!override) {
      continue;
    }

    let touched = false;

    const manualAccountEntries = buildManualIdEntries(override, player.canonical_handle);

    if (manualAccountEntries.length > 0) {
      player.account_ids = mergeIdEntries(player.account_ids.concat(manualAccountEntries));
      touched = true;
    }

    if (override.aliases && typeof override.aliases === 'object') {
      for (const [aliasKey, values] of Object.entries(override.aliases)) {
        if (!Array.isArray(values)) {
          continue;
        }

        player.aliases[aliasKey] = unique((player.aliases[aliasKey] || []).concat(values));
        touched = true;
      }
    }

    if (!touched) {
      continue;
    }

    player.steam_ids = mergeIdEntries(
      player.steam_ids.concat(
        player.account_ids
          .map((entry) => deriveSteamId64(entry.value))
          .filter(Boolean)
          .map((value) => ({
            confidence: 'derived',
            source: 'derived_from_account_id',
            value,
          })),
      ),
    );

    player.resolution_evidence = unique(
      (player.resolution_evidence || []).concat('manual_override_account_id'),
    );

    if (player.liquipedia_page_title && player.account_ids.length > 0) {
      player.resolution_status = 'resolved_with_player_page_and_ids';
      player.resolution_confidence = 'high';
    } else if (player.account_ids.length > 0) {
      player.resolution_status = 'resolved_with_teamcard_account_id_only';
      player.resolution_confidence = 'medium';
    }

    appliedCount += 1;
  }

  return appliedCount;
}

function joinPlayerRecord(groupKey, observations) {
  const page = observations.find((observation) => observation.resolved_player_page)?.resolved_player_page;
  const observedNames = unique(observations.map((observation) => observation.observed_name));
  const linkedPageHints = unique(
    observations.map((observation) => observation.linked_player_page).filter(Boolean),
  );
  const liquipediaHandles = unique(
    [
      page?.primary_handle,
      ...(page?.alternate_handles || []),
      ...(page ? [page.page_title] : []),
    ].filter(Boolean),
  );
  const legalNames = unique(page?.legal_names || []);
  const romanizedNames = unique(page?.romanized_names || []);

  const accountIds = mergeIdEntries(
    observations
      .flatMap((observation) => observation.observed_account_ids || [])
      .concat(page?.account_ids || []),
  );
  const steamIds = mergeIdEntries(
    observations
      .flatMap(() => [])
      .concat(page?.steam_ids || [])
      .concat(
        accountIds
          .map((entry) => deriveSteamId64(entry.value))
          .filter(Boolean)
          .map((value) => ({
            confidence: 'derived',
            source: 'derived_from_account_id',
            value,
          })),
      ),
  );

  let resolutionStatus = 'unresolved_name_only';
  let resolutionConfidence = 'low';

  if (page && accountIds.length > 0) {
    resolutionStatus = 'resolved_with_player_page_and_ids';
    resolutionConfidence = 'high';
  } else if (page) {
    resolutionStatus = 'resolved_with_player_page_without_ids';
    resolutionConfidence = 'medium';
  } else if (accountIds.length > 0) {
    resolutionStatus = 'resolved_with_teamcard_account_id_only';
    resolutionConfidence = 'medium';
  }

  const canonicalHandle =
    page?.primary_handle || page?.page_title || observedNames[0] || groupKey.replace(/^[^:]+:/, '');
  const canonicalHandleSource = page?.primary_handle
    ? 'liquipedia_player_infobox.id'
    : page?.page_title
      ? 'liquipedia_page_title'
      : 'tournament_teamcard.observed_name';

  const tournaments = unique(observations.map((observation) => observation.tournament_title));
  const primaryTargetTournaments = tournaments.filter(
    (title) => !SUPPLEMENTAL_ONLY_TOURNAMENTS.has(title),
  );
  const supplementalSourceTournaments = tournaments.filter((title) =>
    SUPPLEMENTAL_ONLY_TOURNAMENTS.has(title),
  );
  const primaryTargetAppearances = observations.filter(
    (observation) => !SUPPLEMENTAL_ONLY_TOURNAMENTS.has(observation.tournament_title),
  ).length;
  const supplementalSourceAppearances = observations.length - primaryTargetAppearances;
  const resolutionEvidence = unique(
    [
      page?.page_title ? 'player_page_infobox' : null,
      observations.some((observation) => observation.linked_player_page)
        ? 'teamcard_link'
        : null,
      observations.some((observation) => observation.observed_account_ids?.length)
        ? 'teamcard_account_id'
        : null,
      page?.account_ids?.length ? 'player_page_account_id' : null,
      page?.steam_ids?.length ? 'player_page_steam_id' : null,
      !page && !accountIds.length ? 'observed_name_only' : null,
    ].filter(Boolean),
  );

  return {
    account_ids: accountIds,
    aliases: {
      legal_names: legalNames,
      linked_page_hints: linkedPageHints,
      liquipedia_handles: liquipediaHandles,
      observed_names: observedNames,
      romanized_names: romanizedNames,
    },
    appearances: observations.map((observation) => ({
      linked_player_page: observation.linked_player_page,
      lookup_source: observation.player_lookup_source,
      observed_account_ids: (observation.observed_account_ids || []).map((entry) => entry.value),
      observed_name: observation.observed_name,
      slot: observation.slot,
      source_page_title: observation.source_page_title,
      team_name: observation.team_name,
      tournament_page_title: observation.tournament_page_title,
      tournament_start_date: observation.tournament_start_date,
      tournament_title: observation.tournament_title,
      tournament_url: observation.tournament_url,
    })),
    canonical_handle: canonicalHandle,
    canonical_handle_source: canonicalHandleSource,
    liquipedia_page_title: page?.page_title || null,
    liquipedia_url: page?.liquipedia_url || null,
    primary_target_appearances: primaryTargetAppearances,
    primary_target_tournaments: primaryTargetTournaments,
    resolution_confidence: resolutionConfidence,
    resolution_evidence: resolutionEvidence,
    resolution_status: resolutionStatus,
    scope_role:
      primaryTargetTournaments.length === 0
        ? 'supplemental_only'
        : supplementalSourceTournaments.length === 0
          ? 'primary_only'
          : 'primary_with_supplemental',
    supplemental_source_appearances: supplementalSourceAppearances,
    supplemental_source_tournaments: supplementalSourceTournaments,
    steam_ids: steamIds,
    tournaments,
  };
}

function summarizePlayers(players, observations, tournamentPageStats, cleanupStats) {
  return {
    cleanup_group_merges: cleanupStats.mergedGroupCount,
    players_after_cleanup_before_scope_filter: cleanupStats.preScopeFilterPlayerCount,
    players_with_account_ids: players.filter((player) => player.account_ids.length > 0).length,
    players_with_any_numeric_id: players.filter(
      (player) => player.account_ids.length > 0 || player.steam_ids.length > 0,
    ).length,
    players_with_derived_steam_ids: players.filter((player) =>
      player.steam_ids.some((entry) => entry.confidence === 'derived'),
    ).length,
    players_with_explicit_account_ids: players.filter(
      (player) => player.account_ids.length > 0,
    ).length,
    players_with_explicit_steam_ids: players.filter((player) =>
      player.steam_ids.some((entry) => entry.confidence === 'explicit'),
    ).length,
    players_with_liquipedia_player_page: players.filter(
      (player) => Boolean(player.liquipedia_page_title),
    ).length,
    players_with_steam_ids: players.filter((player) => player.steam_ids.length > 0).length,
    players_excluded_as_supplemental_only: cleanupStats.supplementalOnlyExcluded,
    players_with_manual_override_account_ids: players.filter((player) =>
      player.resolution_evidence.includes('manual_override_account_id'),
    ).length,
    players_without_numeric_id: players.filter(
      (player) => player.account_ids.length === 0 && player.steam_ids.length === 0,
    ).length,
    roster_observations: observations.filter(
      (observation) => observation.observation_type !== 'missing_tournament_page',
    ).length,
    tournaments_loaded_from_stage1_cache: tournamentPageStats.loadedFromStage1Cache,
    tournaments_missing_from_stage1_cache: tournamentPageStats.missingFromStage1Cache,
    tournaments_fetched_live: tournamentPageStats.fetchedLive,
    unique_players: players.length,
    unresolved_name_only_players: players.filter(
      (player) => player.resolution_status === 'unresolved_name_only',
    ).length,
  };
}

function buildCsvRows(players) {
  return players.map((player) => ({
    account_ids: player.account_ids.map((entry) => entry.value),
    canonical_handle: player.canonical_handle,
    canonical_handle_source: player.canonical_handle_source,
    legal_names: player.aliases.legal_names,
    liquipedia_handles: player.aliases.liquipedia_handles,
    liquipedia_page_title: player.liquipedia_page_title,
    liquipedia_url: player.liquipedia_url,
    observed_names: player.aliases.observed_names,
    primary_tournaments: player.primary_target_tournaments,
    resolution_confidence: player.resolution_confidence,
    resolution_evidence: player.resolution_evidence,
    resolution_status: player.resolution_status,
    romanized_names: player.aliases.romanized_names,
    scope_role: player.scope_role,
    steam_ids: player.steam_ids.map((entry) =>
      entry.confidence === 'derived' ? `${entry.value} (derived)` : entry.value,
    ),
    supplemental_tournaments: player.supplemental_source_tournaments,
    tournament_count: player.tournaments.length,
    tournaments: player.tournaments,
  }));
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  fs.mkdirSync(DEFAULT_DATA_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(options.jsonPath), { recursive: true });
  fs.mkdirSync(path.dirname(options.csvPath), { recursive: true });

  const scope = JSON.parse(fs.readFileSync(options.scopePath, 'utf8'));
  const scopeCandidates = scope.candidates || [];
  const scopeTitles = scopeCandidates.map((candidate) => candidate.liquipedia_page_title);

  console.log(`[stage2] scope tournaments: ${scopeTitles.length}`);

  const stage1CachedPages = loadCachedPagesByTitle(options.stage1CacheDir, scopeTitles);
  const tournamentPagesByTitle = new Map(stage1CachedPages);
  const missingTournamentTitles = scopeTitles.filter((title) => !tournamentPagesByTitle.has(title));
  let fetchedTournamentPages = 0;

  if (missingTournamentTitles.length > 0) {
    console.log(
      `[stage2] stage1 cache misses: ${missingTournamentTitles.length}; fetching missing tournament pages live`,
    );

    const tournamentClient = new LiquipediaApiClient({
      cacheDir: options.cacheDir,
      minIntervalMs: options.minIntervalMs,
      refreshCache: options.refreshCache,
      userAgent: options.userAgent,
    });

    for (const batch of chunk(missingTournamentTitles, options.batchSize)) {
      const pages = await tournamentClient.fetchPageBatch(batch);

      for (const page of pages) {
        if (!page.missing) {
          tournamentPagesByTitle.set(page.title, page);
          fetchedTournamentPages += 1;
        }
      }
    }
  }

  const observations = extractTournamentObservations(scopeCandidates, tournamentPagesByTitle);
  const lookupTitles = collectPlayerLookupTitles(observations);

  console.log(
    `[stage2] roster observations: ${
      observations.filter((observation) => observation.observation_type !== 'missing_tournament_page')
        .length
    }`,
  );
  console.log(`[stage2] unique player lookup titles: ${lookupTitles.length}`);

  const playerClient = new LiquipediaApiClient({
    cacheDir: options.cacheDir,
    minIntervalMs: options.minIntervalMs,
    refreshCache: options.refreshCache,
    userAgent: options.userAgent,
  });
  const requestedToPlayerPage = await fetchPlayerPages(
    playerClient,
    lookupTitles,
    options.batchSize,
  );

  for (const observation of observations) {
    if (observation.observation_type === 'missing_tournament_page') {
      continue;
    }

    const requestedTitle = observation.linked_player_page || observation.observed_name;
    observation.resolved_player_page = requestedToPlayerPage.get(requestedTitle) || null;
  }

  const manualOverrides = loadManualOverrides(options.manualOverridesPath);
  console.log(`[stage2] manual overrides loaded: ${manualOverrides.size}`);

  const groups = new Map();

  for (const observation of observations) {
    if (observation.observation_type === 'missing_tournament_page') {
      continue;
    }

    const groupKey = buildGroupKey(observation);
    const existing = groups.get(groupKey) || [];
    existing.push(observation);
    groups.set(groupKey, existing);
  }

  const mergedGroups = mergeObservationGroups(groups);
  const allPlayers = [...mergedGroups.groups.entries()]
    .map(([groupKey, groupObservations]) => joinPlayerRecord(groupKey, groupObservations))
    .sort((left, right) => left.canonical_handle.localeCompare(right.canonical_handle));
  const players = allPlayers.filter((player) => player.scope_role !== 'supplemental_only');
  const manualOverridesApplied = applyManualOverrides(players, manualOverrides);

  const summary = summarizePlayers(players, observations, {
    fetchedLive: fetchedTournamentPages,
    loadedFromStage1Cache: stage1CachedPages.size,
    missingFromStage1Cache: missingTournamentTitles.length,
  }, {
    mergedGroupCount: mergedGroups.mergedGroupCount,
    preScopeFilterPlayerCount: allPlayers.length,
    supplementalOnlyExcluded: allPlayers.length - players.length,
  });

  const payload = {
    cleanup: {
      rules_applied: [
        'strip unclosed comment or ref remnants from observed handles before normalization',
        'prefer explicit TeamCard linked-page hints as grouping keys before name-only fallback',
        'merge unresolved name-only groups into a uniquely matching resolved/id-backed entity when the normalized observed handle matches',
        'preserve numeric-looking handles unless other parse evidence is clearly broken',
        'exclude players seen only in supplemental tournaments while keeping supplemental observations for mixed-scope players',
        'apply optional manual player-account overrides after Liquipedia-only grouping so unresolved roster names can be enriched reproducibly',
      ],
      supplemental_only_tournaments: [...SUPPLEMENTAL_ONLY_TOURNAMENTS],
    },
    generated_at: new Date().toISOString(),
    scope: {
      candidate_tournament_count: scope.counts?.candidateTournaments || scopeCandidates.length,
      rule:
        'The player scope is inherited from the integrated pre-2014 likely-ticketless tournament list. This stage does not re-decide ticket status, and it excludes players who appear only in supplemental tournaments.',
      scope_file: path.relative(path.resolve(STAGE_ROOT, '..', '..'), options.scopePath),
      source_hierarchy: scope.source_hierarchy || null,
      supplemental_only_tournaments: [...SUPPLEMENTAL_ONLY_TOURNAMENTS],
    },
    provenance: {
      endpoints_used: ['action=query&prop=revisions'],
      player_page_signals: [
        'Infobox player.id',
        'Infobox player.ids',
        'Infobox player.playerid/accountid',
        'Infobox player.steamid/steamid64',
      ],
      tournament_page_signals: ['TeamCard.pX', 'TeamCard.pXlink', 'TeamCard.pXid'],
      manual_overrides_file:
        manualOverrides.size > 0
          ? path.relative(path.resolve(STAGE_ROOT, '..', '..'), options.manualOverridesPath)
          : null,
      manual_overrides_applied: manualOverridesApplied,
      user_agent: options.userAgent,
      wiki: 'Liquipedia Dota 2',
    },
    heuristic_caveats: {
      id_resolution:
        'Numeric IDs are only explicit when present in Liquipedia TeamCard fields or Liquipedia player-page infobox fields. Derived SteamID64 values are marked as derived_from_account_id.',
      numeric_handles:
        'Numeric-looking handles are preserved unless other parse evidence is clearly broken. They are not discarded just for being numeric.',
      unresolved_players:
        'Players without a resolved Liquipedia page or numeric ID remain grouped by normalized observed name only and should be treated as lower-confidence entities.',
    },
    summary,
    players,
  };

  fs.writeFileSync(options.jsonPath, `${JSON.stringify(payload, null, 2)}\n`);
  writeCsv(options.csvPath, buildCsvRows(players));

  console.log(`[stage2] wrote JSON: ${options.jsonPath}`);
  console.log(`[stage2] wrote CSV: ${options.csvPath}`);
  console.log(`[stage2] cleanup group merges: ${summary.cleanup_group_merges}`);
  console.log(`[stage2] manual overrides applied: ${manualOverridesApplied}`);
  console.log(
    `[stage2] supplemental-only players excluded: ${summary.players_excluded_as_supplemental_only}`,
  );
  console.log(`[stage2] unique players: ${summary.unique_players}`);
  console.log(`[stage2] players with numeric ids: ${summary.players_with_any_numeric_id}`);
  console.log(`[stage2] players without numeric ids: ${summary.players_without_numeric_id}`);
}

main().catch((error) => {
  console.error('[stage2] failed');
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
