#!/usr/bin/env node
// 抓取指定 X 账号的公开推文
// 输出: feed-x.json

import { writeFile } from 'fs/promises';
import * as cheerio from 'cheerio';

const ACCOUNTS = [
  { name: 'Gavin Baker', handle: 'GasparBaker' }
  // 这里可以添加更多账号
];

const NITTER_INSTANCES = [
  'https://nitter.net',
  'https://nitter.privacydev.net',
  'https://nitter.poast.org',
  'https://nitter.tiekoetter.com'
];

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    redirect: 'follow'
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function parseTweets(html, account) {
  const $ = cheerio.load(html);
  const tweets = [];

  $('.timeline-item').each((_, el) => {
    const $el = $(el);
    if ($el.find('.show-more').length) return; // skip load more placeholder

    const tweetLink = $el.find('a.tweet-link').attr('href');
    const id = tweetLink ? tweetLink.split('/').pop().split('#')[0] : null;
    const dateAttr = $el.find('.tweet-date a').attr('title');
    const date = dateAttr ? new Date(dateAttr).toISOString() : null;
    const text = $el.find('.tweet-content .tweet-content, .tweet-content.media-body').text().trim();

    if (id && text) {
      tweets.push({
        id,
        url: `https://x.com/${account.handle}/status/${id}`,
        publishedAt: date,
        text: text.replace(/\s+/g, ' ')
      });
    }
  });

  return tweets;
}

async function fetchAccountTweets(account) {
  for (const instance of NITTER_INSTANCES) {
    const url = `${instance}/${account.handle}`;
    try {
      console.log(`Trying ${url} ...`);
      const html = await fetchHTML(url);
      const tweets = parseTweets(html, account);
      if (tweets.length > 0) {
        return {
          name: account.name,
          handle: account.handle,
          tweets
        };
      }
    } catch (err) {
      console.error(`Failed ${url}: ${err.message}`);
      await sleep(500);
    }
  }
  return { name: account.name, handle: account.handle, tweets: [], error: 'All Nitter instances failed' };
}

async function main() {
  const results = [];
  for (const account of ACCOUNTS) {
    const result = await fetchAccountTweets(account);
    results.push(result);
    await sleep(1000);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    x: results
  };

  await writeFile('feed-x.json', JSON.stringify(output, null, 2));
  console.log(`Wrote feed-x.json with ${results.length} accounts`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
