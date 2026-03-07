const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

function ensureParentDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function openDatabase(databasePath) {
  ensureParentDirectory(databasePath);

  const database = new DatabaseSync(databasePath);
  database.exec('PRAGMA foreign_keys = ON;');

  database.exec(`
    CREATE TABLE IF NOT EXISTS pipeline_runs (
      run_id TEXT PRIMARY KEY,
      api_base TEXT NOT NULL,
      before_year INTEGER NOT NULL,
      earliest_explicit_ticket_date TEXT,
      finished_at TEXT,
      from_year INTEGER NOT NULL,
      notes TEXT,
      request_min_interval_ms INTEGER NOT NULL,
      search_query_template TEXT NOT NULL,
      started_at TEXT NOT NULL,
      user_agent TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tournament_pages (
      page_id INTEGER PRIMARY KEY,
      title TEXT NOT NULL UNIQUE,
      matched_years_json TEXT NOT NULL,
      categories_json TEXT NOT NULL,
      infobox_template TEXT,
      infobox_name TEXT,
      series TEXT,
      organizer TEXT,
      sponsor TEXT,
      tournament_type TEXT,
      country TEXT,
      city TEXT,
      venue TEXT,
      format_text TEXT,
      sdate_raw TEXT,
      edate_raw TEXT,
      start_date_sort TEXT,
      end_date_sort TEXT,
      start_year INTEGER,
      end_year INTEGER,
      team_number TEXT,
      prizepool TEXT,
      prizepoolusd TEXT,
      localcurrency TEXT,
      liquipediatier TEXT,
      publishertier TEXT,
      dotatv_raw TEXT,
      dotatv_display TEXT,
      leagueid TEXT,
      game_raw TEXT,
      normalized_game TEXT,
      game_assumed_dota2 INTEGER NOT NULL,
      is_dota2 INTEGER NOT NULL,
      is_subpage INTEGER NOT NULL,
      is_qualifier INTEGER NOT NULL,
      included_in_export INTEGER NOT NULL,
      exclusion_reason TEXT,
      ticket_status TEXT,
      ticket_confidence TEXT,
      ticket_reason TEXT,
      fetched_at TEXT NOT NULL,
      run_id TEXT NOT NULL,
      raw_infobox_json TEXT NOT NULL,
      raw_infobox_text TEXT,
      FOREIGN KEY (run_id) REFERENCES pipeline_runs(run_id)
    );

    CREATE INDEX IF NOT EXISTS tournament_pages_run_id_idx
      ON tournament_pages (run_id);

    CREATE INDEX IF NOT EXISTS tournament_pages_start_year_idx
      ON tournament_pages (start_year);
  `);

  return database;
}

function upsertRun(database, run) {
  const statement = database.prepare(`
    INSERT INTO pipeline_runs (
      run_id,
      api_base,
      before_year,
      earliest_explicit_ticket_date,
      finished_at,
      from_year,
      notes,
      request_min_interval_ms,
      search_query_template,
      started_at,
      user_agent
    ) VALUES (
      :run_id,
      :api_base,
      :before_year,
      :earliest_explicit_ticket_date,
      :finished_at,
      :from_year,
      :notes,
      :request_min_interval_ms,
      :search_query_template,
      :started_at,
      :user_agent
    )
    ON CONFLICT(run_id) DO UPDATE SET
      earliest_explicit_ticket_date = excluded.earliest_explicit_ticket_date,
      finished_at = excluded.finished_at,
      notes = excluded.notes;
  `);

  statement.run(run);
}

function upsertTournamentPage(database, record) {
  const statement = database.prepare(`
    INSERT INTO tournament_pages (
      page_id,
      title,
      matched_years_json,
      categories_json,
      infobox_template,
      infobox_name,
      series,
      organizer,
      sponsor,
      tournament_type,
      country,
      city,
      venue,
      format_text,
      sdate_raw,
      edate_raw,
      start_date_sort,
      end_date_sort,
      start_year,
      end_year,
      team_number,
      prizepool,
      prizepoolusd,
      localcurrency,
      liquipediatier,
      publishertier,
      dotatv_raw,
      dotatv_display,
      leagueid,
      game_raw,
      normalized_game,
      game_assumed_dota2,
      is_dota2,
      is_subpage,
      is_qualifier,
      included_in_export,
      exclusion_reason,
      ticket_status,
      ticket_confidence,
      ticket_reason,
      fetched_at,
      run_id,
      raw_infobox_json,
      raw_infobox_text
    ) VALUES (
      :page_id,
      :title,
      :matched_years_json,
      :categories_json,
      :infobox_template,
      :infobox_name,
      :series,
      :organizer,
      :sponsor,
      :tournament_type,
      :country,
      :city,
      :venue,
      :format_text,
      :sdate_raw,
      :edate_raw,
      :start_date_sort,
      :end_date_sort,
      :start_year,
      :end_year,
      :team_number,
      :prizepool,
      :prizepoolusd,
      :localcurrency,
      :liquipediatier,
      :publishertier,
      :dotatv_raw,
      :dotatv_display,
      :leagueid,
      :game_raw,
      :normalized_game,
      :game_assumed_dota2,
      :is_dota2,
      :is_subpage,
      :is_qualifier,
      :included_in_export,
      :exclusion_reason,
      :ticket_status,
      :ticket_confidence,
      :ticket_reason,
      :fetched_at,
      :run_id,
      :raw_infobox_json,
      :raw_infobox_text
    )
    ON CONFLICT(page_id) DO UPDATE SET
      title = excluded.title,
      matched_years_json = excluded.matched_years_json,
      categories_json = excluded.categories_json,
      infobox_template = excluded.infobox_template,
      infobox_name = excluded.infobox_name,
      series = excluded.series,
      organizer = excluded.organizer,
      sponsor = excluded.sponsor,
      tournament_type = excluded.tournament_type,
      country = excluded.country,
      city = excluded.city,
      venue = excluded.venue,
      format_text = excluded.format_text,
      sdate_raw = excluded.sdate_raw,
      edate_raw = excluded.edate_raw,
      start_date_sort = excluded.start_date_sort,
      end_date_sort = excluded.end_date_sort,
      start_year = excluded.start_year,
      end_year = excluded.end_year,
      team_number = excluded.team_number,
      prizepool = excluded.prizepool,
      prizepoolusd = excluded.prizepoolusd,
      localcurrency = excluded.localcurrency,
      liquipediatier = excluded.liquipediatier,
      publishertier = excluded.publishertier,
      dotatv_raw = excluded.dotatv_raw,
      dotatv_display = excluded.dotatv_display,
      leagueid = excluded.leagueid,
      game_raw = excluded.game_raw,
      normalized_game = excluded.normalized_game,
      game_assumed_dota2 = excluded.game_assumed_dota2,
      is_dota2 = excluded.is_dota2,
      is_subpage = excluded.is_subpage,
      is_qualifier = excluded.is_qualifier,
      included_in_export = excluded.included_in_export,
      exclusion_reason = excluded.exclusion_reason,
      ticket_status = excluded.ticket_status,
      ticket_confidence = excluded.ticket_confidence,
      ticket_reason = excluded.ticket_reason,
      fetched_at = excluded.fetched_at,
      run_id = excluded.run_id,
      raw_infobox_json = excluded.raw_infobox_json,
      raw_infobox_text = excluded.raw_infobox_text;
  `);

  statement.run({
    categories_json: record.categories_json,
    city: record.city,
    country: record.country,
    dotatv_display: record.dotatv_display,
    dotatv_raw: record.dotatv_raw,
    edate_raw: record.edate_raw,
    end_date_sort: record.end_date_sort,
    end_year: record.end_year,
    exclusion_reason: record.exclusion_reason,
    fetched_at: record.fetched_at,
    format_text: record.format_text,
    game_assumed_dota2: record.game_assumed_dota2 ? 1 : 0,
    game_raw: record.game_raw,
    infobox_name: record.infobox_name,
    infobox_template: record.infobox_template,
    included_in_export: record.included_in_export ? 1 : 0,
    is_dota2: record.is_dota2 ? 1 : 0,
    is_qualifier: record.is_qualifier ? 1 : 0,
    is_subpage: record.is_subpage ? 1 : 0,
    leagueid: record.leagueid,
    liquipediatier: record.liquipediatier,
    localcurrency: record.localcurrency,
    matched_years_json: record.matched_years_json,
    normalized_game: record.normalized_game,
    organizer: record.organizer,
    page_id: record.page_id,
    prizepool: record.prizepool,
    prizepoolusd: record.prizepoolusd,
    publishertier: record.publishertier,
    raw_infobox_json: record.raw_infobox_json,
    raw_infobox_text: record.raw_infobox_text,
    run_id: record.run_id,
    sdate_raw: record.sdate_raw,
    series: record.series,
    sponsor: record.sponsor,
    start_date_sort: record.start_date_sort,
    start_year: record.start_year,
    team_number: record.team_number,
    ticket_confidence: record.ticket_confidence,
    ticket_reason: record.ticket_reason,
    ticket_status: record.ticket_status,
    title: record.title,
    tournament_type: record.tournament_type,
    venue: record.venue,
  });
}

function writeJsonExport(exportPath, payload) {
  ensureParentDirectory(exportPath);
  fs.writeFileSync(exportPath, JSON.stringify(payload, null, 2));
}

module.exports = {
  openDatabase,
  upsertRun,
  upsertTournamentPage,
  writeJsonExport,
};
