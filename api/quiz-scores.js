import { randomUUID } from "node:crypto";

const SCORE_ENTRIES_KEY = "speed-quiz:score-entries";
const SCORE_TOTAL_KEY = "speed-quiz:score-total";

function sendJson(response, status, payload) {
  response.status(status).json(payload);
}

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function redisPipeline(commands) {
  const config = getRedisConfig();
  if (!config) {
    const error = new Error("Quiz stats storage is not configured.");
    error.code = "not_configured";
    throw error;
  }

  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    const error = new Error(`Redis request failed with ${response.status}.`);
    error.code = "redis_error";
    throw error;
  }

  return response.json();
}

function parseRedisResult(results, index, fallback = null) {
  const item = results?.[index];
  if (!item || item.error) return fallback;
  return item.result ?? fallback;
}

function normalizeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function buildStats({ count, total, best, rank, topScores, score }) {
  const totalCount = normalizeNumber(count);
  const totalScore = normalizeNumber(total);
  const average = totalCount > 0 ? totalScore / totalCount : 0;
  const numericRank = rank == null ? null : normalizeNumber(rank) + 1;

  return {
    configured: true,
    score,
    totalPlayers: totalCount,
    averageScore: Number(average.toFixed(2)),
    bestScore: normalizeNumber(best),
    rank: numericRank,
    percentile:
      numericRank && totalCount > 0
        ? Math.max(0, Math.min(100, Math.round(((totalCount - numericRank + 1) / totalCount) * 100)))
        : null,
    topScores: Array.isArray(topScores) ? topScores.map((value) => normalizeNumber(value)) : [],
  };
}

async function getStats(score = null) {
  const commands = [
    ["ZCARD", SCORE_ENTRIES_KEY],
    ["GET", SCORE_TOTAL_KEY],
    ["ZREVRANGE", SCORE_ENTRIES_KEY, 0, 0, "WITHSCORES"],
    ["ZREVRANGE", SCORE_ENTRIES_KEY, 0, 4, "WITHSCORES"],
  ];

  if (score !== null) {
    commands.push(["ZCOUNT", SCORE_ENTRIES_KEY, `(${score}`, "+inf"]);
  }

  const results = await redisPipeline(commands);
  const bestResult = parseRedisResult(results, 2, []);
  const topResult = parseRedisResult(results, 3, []);
  const rank = score === null ? null : parseRedisResult(results, 4, null);
  const topScores = [];

  for (let index = 1; index < topResult.length; index += 2) {
    topScores.push(topResult[index]);
  }

  return buildStats({
    count: parseRedisResult(results, 0, 0),
    total: parseRedisResult(results, 1, 0),
    best: bestResult?.[1] ?? 0,
    rank,
    topScores,
    score,
  });
}

async function submitScore(score) {
  const member = `entry:${Date.now()}:${randomUUID()}`;

  const results = await redisPipeline([
    ["ZADD", SCORE_ENTRIES_KEY, score, member],
    ["INCRBYFLOAT", SCORE_TOTAL_KEY, score],
    ["ZCARD", SCORE_ENTRIES_KEY],
    ["GET", SCORE_TOTAL_KEY],
    ["ZREVRANGE", SCORE_ENTRIES_KEY, 0, 0, "WITHSCORES"],
    ["ZCOUNT", SCORE_ENTRIES_KEY, `(${score}`, "+inf"],
    ["ZREVRANGE", SCORE_ENTRIES_KEY, 0, 4, "WITHSCORES"],
  ]);

  const topResult = parseRedisResult(results, 6, []);
  const topScores = [];
  for (let index = 1; index < topResult.length; index += 2) {
    topScores.push(topResult[index]);
  }

  return buildStats({
    count: parseRedisResult(results, 2, 0),
    total: parseRedisResult(results, 3, 0),
    best: parseRedisResult(results, 4, [])?.[1] ?? 0,
    rank: parseRedisResult(results, 5, null),
    topScores,
    score,
  });
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  try {
    if (request.method === "GET") {
      sendJson(response, 200, await getStats());
      return;
    }

    if (request.method === "POST") {
      const score = normalizeNumber(request.body?.score, NaN);
      if (!Number.isInteger(score) || score < 0 || score > 100000) {
        sendJson(response, 400, { error: "invalid_score" });
        return;
      }

      sendJson(response, 200, await submitScore(score));
      return;
    }

    response.setHeader("Allow", "GET, POST");
    sendJson(response, 405, { error: "method_not_allowed" });
  } catch (error) {
    if (error.code === "not_configured") {
      sendJson(response, 503, {
        configured: false,
        error: "not_configured",
      });
      return;
    }

    sendJson(response, 500, {
      error: "stats_unavailable",
    });
  }
}
