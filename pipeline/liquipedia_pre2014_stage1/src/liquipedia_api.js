const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const API_BASE_URL = 'https://liquipedia.net/dota2/api.php';
const DEFAULT_USER_AGENT =
  'dota-stats-archive-liquipedia-stage1/1.0 (local workspace; contact: local)';
const DEFAULT_MIN_INTERVAL_MS = 2100;
const SEARCH_LIMIT = 50;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function serializeParams(params) {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right));

  const searchParams = new URLSearchParams();

  for (const [key, value] of entries) {
    if (Array.isArray(value)) {
      searchParams.set(key, value.join('|'));
      continue;
    }

    searchParams.set(key, String(value));
  }

  return searchParams.toString();
}

class LiquipediaApiClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || API_BASE_URL;
    this.cacheDir = options.cacheDir || null;
    this.logger = options.logger || console;
    this.minIntervalMs = options.minIntervalMs || DEFAULT_MIN_INTERVAL_MS;
    this.nextRequestAt = 0;
    this.refreshCache = Boolean(options.refreshCache);
    this.userAgent = options.userAgent || DEFAULT_USER_AGENT;

    if (this.cacheDir) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  async request(params) {
    const mergedParams = {
      action: 'query',
      format: 'json',
      formatversion: '2',
      ...params,
    };

    const query = serializeParams(mergedParams);
    const cachePath = this.cacheDir
      ? path.join(
          this.cacheDir,
          `${crypto.createHash('sha1').update(query).digest('hex')}.json`,
        )
      : null;

    if (cachePath && !this.refreshCache && fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath, 'utf8')).data;
    }

    await this.waitForSlot();

    const url = `${this.baseUrl}?${query}`;
    let lastError = null;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip',
            'User-Agent': this.userAgent,
          },
        });

        const body = await response.text();

        if (!response.ok) {
          const error = new Error(
            `Liquipedia API returned ${response.status}: ${body.slice(0, 400)}`,
          );

          if (response.status === 429 || response.status >= 500) {
            throw error;
          }

          error.retryable = false;
          throw error;
        }

        const data = JSON.parse(body);

        if (data.error) {
          const error = new Error(
            `Liquipedia API error ${data.error.code || 'unknown'}: ${
              data.error.info || JSON.stringify(data.error)
            }`,
          );
          error.retryable = false;
          throw error;
        }

        if (cachePath) {
          fs.writeFileSync(
            cachePath,
            JSON.stringify(
              {
                fetchedAt: new Date().toISOString(),
                query,
                url,
                data,
              },
              null,
              2,
            ),
          );
        }

        return data;
      } catch (error) {
        lastError = error;

        if (error.retryable === false || attempt === 3) {
          break;
        }

        await sleep(attempt * 2000);
      }
    }

    throw lastError;
  }

  async searchTournamentPagesByYear(year) {
    const results = [];
    let continueState = {};

    while (true) {
      const data = await this.request({
        list: 'search',
        srsearch: `${year} incategory:Tournaments`,
        srnamespace: 0,
        srlimit: SEARCH_LIMIT,
        ...continueState,
      });

      for (const hit of data?.query?.search || []) {
        results.push({
          pageId: hit.pageid,
          title: hit.title,
          year,
        });
      }

      if (!data.continue) {
        break;
      }

      continueState = data.continue;
    }

    return results;
  }

  async fetchPageBatch(titles) {
    const data = await this.request({
      prop: 'categories|revisions',
      titles,
      redirects: 1,
      cllimit: 'max',
      rvprop: 'content',
      rvslots: 'main',
    });

    return data?.query?.pages || [];
  }

  async waitForSlot() {
    const now = Date.now();
    const delay = this.nextRequestAt - now;

    if (delay > 0) {
      await sleep(delay);
    }

    this.nextRequestAt = Date.now() + this.minIntervalMs;
  }
}

module.exports = {
  API_BASE_URL,
  DEFAULT_MIN_INTERVAL_MS,
  DEFAULT_USER_AGENT,
  LiquipediaApiClient,
};
