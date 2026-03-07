function extractInfoboxTemplate(wikitext) {
  if (!wikitext) {
    return null;
  }

  const match = /\{\{\s*Infobox [^\n]*/i.exec(wikitext);

  if (!match) {
    return null;
  }

  const startIndex = match.index;
  let depth = 0;

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
        return wikitext.slice(startIndex, index + 2);
      }

      index += 1;
    }
  }

  return null;
}

function parseInfoboxTemplate(rawTemplate) {
  if (!rawTemplate) {
    return {
      rawTemplate: null,
      templateName: null,
      params: {},
    };
  }

  const lines = rawTemplate.split(/\r?\n/);
  const firstLine = lines.shift() || '';
  const templateName = firstLine.replace(/^\{\{/, '').trim();
  const params = {};
  const queue = [...lines];

  let currentKey = null;
  let currentValueLines = [];

  const flushCurrent = () => {
    if (!currentKey) {
      return;
    }

    params[currentKey] = currentValueLines.join('\n').trim();
    currentKey = null;
    currentValueLines = [];
  };

  while (queue.length > 0) {
    const line = queue.shift();
    const keyMatch = line.match(/^\|\s*([^=]+?)\s*=(.*)$/);

    if (keyMatch) {
      flushCurrent();
      currentKey = keyMatch[1].trim().toLowerCase();
      const value = keyMatch[2];
      const inlineMatch = value.match(/\|[A-Za-z0-9_ -]+\s*=/);

      if (inlineMatch) {
        const splitIndex = inlineMatch.index;
        currentValueLines = [value.slice(0, splitIndex)];
        queue.unshift(value.slice(splitIndex));
      } else {
        currentValueLines = [value];
      }

      continue;
    }

    if (line.trim() === '}}') {
      flushCurrent();
      continue;
    }

    if (currentKey) {
      currentValueLines.push(line);
    }
  }

  flushCurrent();

  return {
    rawTemplate,
    templateName,
    params,
  };
}

function cleanWikitextValue(value) {
  if (!value) {
    return '';
  }

  return value
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<ref\b[^>]*\/>/gi, ' ')
    .replace(/<ref\b[^>]*>[\s\S]*?<\/ref>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' / ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\{\{!}}/g, '|')
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[https?:\/\/[^\s\]]+\s+([^\]]+)\]/g, '$1')
    .replace(/\[https?:\/\/[^\]]+\]/g, '')
    .replace(/'''?/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDateField(rawValue) {
  const cleaned = cleanWikitextValue(rawValue);

  if (!cleaned) {
    return {
      raw: null,
      sortable: null,
      year: null,
      precise: false,
    };
  }

  const ymdMatch = cleaned.match(
    /\b(19\d{2}|20\d{2})(?:-(\d{2}|\?\?))?(?:-(\d{2}|\?\?))?\b/,
  );

  if (ymdMatch) {
    const year = Number(ymdMatch[1]);
    const month = ymdMatch[2] && ymdMatch[2] !== '??' ? ymdMatch[2] : '01';
    const day = ymdMatch[3] && ymdMatch[3] !== '??' ? ymdMatch[3] : '01';

    return {
      raw: cleaned,
      sortable: `${year}-${month}-${day}`,
      year,
      precise: Boolean(ymdMatch[2] && ymdMatch[2] !== '??' && ymdMatch[3] && ymdMatch[3] !== '??'),
    };
  }

  const yearMatch = cleaned.match(/\b(19\d{2}|20\d{2})\b/);

  if (!yearMatch) {
    return {
      raw: cleaned,
      sortable: null,
      year: null,
      precise: false,
    };
  }

  return {
    raw: cleaned,
    sortable: `${yearMatch[1]}-01-01`,
    year: Number(yearMatch[1]),
    precise: false,
  };
}

function normalizeGame(rawGame) {
  const cleaned = cleanWikitextValue(rawGame).toLowerCase();

  if (!cleaned) {
    return {
      assumedDota2: true,
      isDota2: true,
      normalizedGame: 'dota2',
    };
  }

  if (cleaned === 'dota' || cleaned.includes('defense of the ancients')) {
    return {
      assumedDota2: false,
      isDota2: false,
      normalizedGame: 'dota',
    };
  }

  if (cleaned === 'dota 2' || cleaned === 'dota2' || cleaned.includes('dota 2')) {
    return {
      assumedDota2: false,
      isDota2: true,
      normalizedGame: 'dota2',
    };
  }

  return {
    assumedDota2: false,
    isDota2: true,
    normalizedGame: cleaned,
  };
}

function classifyTicket(record, earliestExplicitTicketDate) {
  if (!record.included_in_export) {
    return {
      ...record,
      ticket_confidence: null,
      ticket_reason: null,
      ticket_status: null,
    };
  }

  if (record.dotatv_display) {
    return {
      ...record,
      ticket_confidence: 'explicit',
      ticket_reason: `infobox.dotatv is present: ${record.dotatv_display}`,
      ticket_status: 'ticketed',
    };
  }

  if (
    earliestExplicitTicketDate &&
    record.start_date_sort &&
    record.start_date_sort < earliestExplicitTicketDate
  ) {
    return {
      ...record,
      ticket_confidence: 'heuristic',
      ticket_reason:
        `no infobox.dotatv field; start date ${record.start_date_sort} is earlier than ` +
        `the earliest explicit ticketed tournament in this dataset (${earliestExplicitTicketDate})`,
      ticket_status: 'likely_ticketless',
    };
  }

  return {
    ...record,
    ticket_confidence: 'unknown',
    ticket_reason: 'no explicit infobox.dotatv field was found in the Liquipedia page source',
    ticket_status: 'unknown',
  };
}

function computeEarliestExplicitTicketDate(records) {
  const sortableDates = records
    .filter((record) => record.included_in_export && record.is_dota2 && record.dotatv_display)
    .map((record) => record.start_date_sort)
    .filter(Boolean)
    .sort();

  return sortableDates[0] || null;
}

function buildTournamentRecord(page, matchedYears, beforeYear) {
  const categories = (page.categories || []).map((category) =>
    category.title.replace(/^Category:/, ''),
  );
  const revision = page.revisions?.[0];
  const wikitext = revision?.slots?.main?.content || null;
  const infobox = parseInfoboxTemplate(extractInfoboxTemplate(wikitext));
  const params = infobox.params;

  const startDate = parseDateField(params.sdate || params.start_date || params.startdate);
  const endDate = parseDateField(params.edate || params.end_date || params.enddate);
  const game = normalizeGame(params.game);
  const dotatvRaw = params.dotatv || '';
  const dotatvDisplay = cleanWikitextValue(dotatvRaw);
  const matchedYearValues = [...matchedYears].sort((left, right) => left - right);
  const hasCutoffMatch =
    (startDate.year !== null && startDate.year < beforeYear) ||
    (startDate.year === null && endDate.year !== null && endDate.year < beforeYear) ||
    (startDate.year === null &&
      endDate.year === null &&
      matchedYearValues.some((year) => year < beforeYear));

  let includedInExport = false;
  let exclusionReason = null;

  if (!wikitext) {
    exclusionReason = 'page_has_no_revision_content';
  } else if (!infobox.rawTemplate) {
    exclusionReason = 'page_has_no_infobox';
  } else if (!game.isDota2) {
    exclusionReason = `excluded_non_dota2_game:${game.normalizedGame}`;
  } else if (!hasCutoffMatch) {
    exclusionReason = `outside_requested_window_before_${beforeYear}`;
  } else {
    includedInExport = true;
  }

  return {
    categories,
    categories_json: JSON.stringify(categories),
    city: cleanWikitextValue(params.city),
    country: cleanWikitextValue(params.country),
    dotatv_display: dotatvDisplay || null,
    dotatv_raw: dotatvRaw || null,
    edate_raw: endDate.raw,
    end_date_sort: endDate.sortable,
    end_year: endDate.year,
    exclusion_reason: exclusionReason,
    fetched_at: new Date().toISOString(),
    format_text: cleanWikitextValue(params.format),
    game_assumed_dota2: game.assumedDota2,
    game_raw: params.game || null,
    included_in_export: includedInExport,
    infobox_name: cleanWikitextValue(params.name),
    infobox_template: infobox.templateName,
    is_dota2: game.isDota2,
    is_qualifier:
      /qualifier/i.test(page.title) || categories.some((category) => /qualifier/i.test(category)),
    is_subpage: page.title.includes('/'),
    leagueid: cleanWikitextValue(params.leagueid),
    liquipediatier: cleanWikitextValue(params.liquipediatier),
    localcurrency: cleanWikitextValue(params.localcurrency),
    matched_years: matchedYearValues,
    matched_years_json: JSON.stringify(matchedYearValues),
    normalized_game: game.normalizedGame,
    organizer: cleanWikitextValue(params.organizer),
    page_id: page.pageid,
    prizepool: cleanWikitextValue(params.prizepool),
    prizepoolusd: cleanWikitextValue(params.prizepoolusd),
    publishertier: cleanWikitextValue(params.publishertier),
    raw_infobox_json: JSON.stringify(infobox.params, null, 2),
    raw_infobox_text: infobox.rawTemplate,
    sdate_raw: startDate.raw,
    series: cleanWikitextValue(params.series),
    sponsor: cleanWikitextValue(params.sponsor),
    start_date_sort: startDate.sortable,
    start_year: startDate.year,
    team_number: cleanWikitextValue(params.team_number),
    ticket_confidence: null,
    ticket_reason: null,
    ticket_status: null,
    title: page.title,
    tournament_type: cleanWikitextValue(params.type),
    venue: cleanWikitextValue(params.venue),
  };
}

function summarizeRecords(records) {
  const summary = {
    excluded_non_dota2: 0,
    included_in_export: 0,
    likely_ticketless: 0,
    ticketed: 0,
    total_candidates: records.length,
    unknown_ticket: 0,
  };

  for (const record of records) {
    if (!record.included_in_export) {
      if (record.exclusion_reason && record.exclusion_reason.startsWith('excluded_non_dota2_game')) {
        summary.excluded_non_dota2 += 1;
      }

      continue;
    }

    summary.included_in_export += 1;

    if (record.ticket_status === 'ticketed') {
      summary.ticketed += 1;
    } else if (record.ticket_status === 'likely_ticketless') {
      summary.likely_ticketless += 1;
    } else if (record.ticket_status === 'unknown') {
      summary.unknown_ticket += 1;
    }
  }

  return summary;
}

module.exports = {
  buildTournamentRecord,
  classifyTicket,
  cleanWikitextValue,
  computeEarliestExplicitTicketDate,
  summarizeRecords,
};
