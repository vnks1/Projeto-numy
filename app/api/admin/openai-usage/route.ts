import { NextResponse } from "next/server";
import { getAdminApiAuthErrorResponse } from "@/lib/admin-session";
import { type Period, PERIOD_MS, parsePeriod } from "@/lib/admin-period";

export const runtime = "nodejs";

type BucketWidth = "1h" | "1d";

const BUCKET_WIDTH_BY_PERIOD: Record<Period, BucketWidth> = {
  "24h": "1h",
  "7d": "1d",
  "30d": "1d",
};

const LIMIT_BY_PERIOD: Record<Period, number> = {
  "24h": 30,
  "7d": 8,
  "30d": 31,
};

const COST_LIMIT_BY_PERIOD: Record<Period, number> = {
  "24h": 2,
  "7d": 8,
  "30d": 31,
};

const OPENAI_USAGE_PROJECT_ID = "proj_uet4BbqKKhwbfxaI7P9cGQl8";
const OPENAI_USD_BRL_RATE_URL =
  "https://api.frankfurter.app/latest?from=USD&to=BRL";
const OPENAI_USD_BRL_PROVIDER = "Frankfurter";

type JsonObject = Record<string, unknown>;

type OpenAIUsageSummary = {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  inputAudioTokens: number;
  outputAudioTokens: number;
  totalRequests: number;
  totalCost: number;
  totalCostBrl: number | null;
  currency: string;
};

type OpenAIUsageTimelineRow = {
  startTime: string;
  endTime: string;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  inputAudioTokens: number;
  outputAudioTokens: number;
  requests: number;
  cost: number | null;
  costBrl: number | null;
};

type OpenAIUsageModelRow = {
  model: string;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  requests: number;
};

type OpenAIFxSnapshot = {
  usdToBrl: number | null;
  date: string | null;
  source: string;
};

export type OpenAIUsageSnapshot = {
  projectId: string;
  projectName: string | null;
  period: Period;
  bucketWidth: BucketWidth;
  generatedAt: string;
  fx: OpenAIFxSnapshot;
  summary: OpenAIUsageSummary;
  timeline: OpenAIUsageTimelineRow[];
  perModel: OpenAIUsageModelRow[];
};

class OpenAIUpstreamError extends Error {
  readonly status: number;
  readonly upstreamCode: string;

  constructor(message: string, status: number, upstreamCode: string) {
    super(message);
    this.name = "OpenAIUpstreamError";
    this.status = status;
    this.upstreamCode = upstreamCode;
  }
}

function getAdminOpenAIKey() {
  return (
    process.env.OPENAI_ADMIN_KEY?.trim() ||
    process.env.OPENAI_ADMIN_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    ""
  );
}

function asObject(value: unknown): JsonObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as JsonObject;
}

function asObjectArray(value: unknown): JsonObject[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => asObject(entry))
    .filter((entry): entry is JsonObject => entry !== null);
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : 0;
  }

  return 0;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getBucketResults(bucket: JsonObject): JsonObject[] {
  const plural = asObjectArray(bucket.results);
  if (plural.length > 0) return plural;
  return asObjectArray(bucket.result);
}

function getResponseData(responseBody: unknown): JsonObject[] {
  const body = asObject(responseBody);
  if (!body) return [];
  return asObjectArray(body.data);
}

function toIsoFromUnix(seconds: number) {
  return new Date(seconds * 1000).toISOString();
}

function getNextUtcDayStartUnix(nowMs: number) {
  const now = new Date(nowMs);
  return Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1) /
      1000,
  );
}

async function fetchOpenAIAdminEndpoint(
  path: "/v1/organization/usage/completions" | "/v1/organization/costs",
  params: {
    startTime: number;
    endTime: number;
    bucketWidth: BucketWidth;
    limit: number;
    projectId: string;
    groupBy: string[];
  },
  apiKey: string,
) {
  const query = new URLSearchParams({
    start_time: String(params.startTime),
    end_time: String(params.endTime),
    bucket_width: params.bucketWidth,
    limit: String(params.limit),
  });
  query.append("project_ids", params.projectId);
  params.groupBy.forEach((value) => query.append("group_by", value));

  const response = await fetch(
    `https://api.openai.com${path}?${query.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const payloadObject = asObject(payload);
    const errorObject = payloadObject ? asObject(payloadObject.error) : null;
    const message =
      asString(errorObject?.message) || "OpenAI API request failed";
    const upstreamCode = asString(errorObject?.code) || "OPENAI_UPSTREAM_ERROR";

    throw new OpenAIUpstreamError(message, response.status, upstreamCode);
  }

  return payload;
}

async function fetchUsdBrlRate(): Promise<OpenAIFxSnapshot> {
  try {
    const response = await fetch(OPENAI_USD_BRL_RATE_URL, {
      method: "GET",
      next: { revalidate: 60 * 60 },
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        usdToBrl: null,
        date: null,
        source: OPENAI_USD_BRL_PROVIDER,
      };
    }

    const body = asObject(payload);
    const rates = body ? asObject(body.rates) : null;
    const usdToBrl = asNumber(rates?.BRL);
    const date = asString(body?.date);

    if (usdToBrl <= 0) {
      return {
        usdToBrl: null,
        date: date || null,
        source: OPENAI_USD_BRL_PROVIDER,
      };
    }

    return {
      usdToBrl,
      date: date || null,
      source: OPENAI_USD_BRL_PROVIDER,
    };
  } catch (error) {
    console.error("OPENAI_USAGE_FX_FETCH_ERROR:", error);
    return {
      usdToBrl: null,
      date: null,
      source: OPENAI_USD_BRL_PROVIDER,
    };
  }
}

function mapOpenAIUsageSnapshot(
  period: Period,
  bucketWidth: BucketWidth,
  usagePayload: unknown,
  costsPayload: unknown,
  fx: OpenAIFxSnapshot,
): OpenAIUsageSnapshot {
  const usageBuckets = getResponseData(usagePayload);
  const costBuckets = getResponseData(costsPayload);

  const costByStartTime = new Map<number, number>();
  let currency = "usd";
  let totalCost = 0;
  let projectName: string | null = null;

  costBuckets.forEach((bucket) => {
    const bucketStartTime = asNumber(bucket.start_time);
    if (bucketStartTime <= 0) return;

    const bucketCost = getBucketResults(bucket).reduce((sum, result) => {
      const amount = asObject(result.amount);
      const value = asNumber(amount?.value);
      const amountCurrency = asString(amount?.currency);
      const currentProjectName = asString(result.project_name);
      if (amountCurrency) {
        currency = amountCurrency;
      }
      if (currentProjectName && !projectName) {
        projectName = currentProjectName;
      }
      return sum + value;
    }, 0);

    totalCost += bucketCost;
    costByStartTime.set(bucketStartTime, bucketCost);
  });

  const timeline: OpenAIUsageTimelineRow[] = [];
  const modelAccumulator = new Map<string, OpenAIUsageModelRow>();

  usageBuckets.forEach((bucket) => {
    const bucketStartTime = asNumber(bucket.start_time);
    if (bucketStartTime <= 0) return;

    const results = getBucketResults(bucket);
    let inputTokens = 0;
    let outputTokens = 0;
    let cachedInputTokens = 0;
    let inputAudioTokens = 0;
    let outputAudioTokens = 0;
    let requests = 0;

    results.forEach((result) => {
      const modelName = asString(result.model) || "unknown";
      const modelInputTokens = asNumber(result.input_tokens);
      const modelOutputTokens = asNumber(result.output_tokens);
      const modelCachedInputTokens = asNumber(result.input_cached_tokens);
      const modelInputAudioTokens = asNumber(result.input_audio_tokens);
      const modelOutputAudioTokens = asNumber(result.output_audio_tokens);
      const modelRequests = asNumber(result.num_model_requests);
      const modelTotalTokens =
        modelInputTokens +
        modelOutputTokens +
        modelInputAudioTokens +
        modelOutputAudioTokens;

      inputTokens += modelInputTokens;
      outputTokens += modelOutputTokens;
      cachedInputTokens += modelCachedInputTokens;
      inputAudioTokens += modelInputAudioTokens;
      outputAudioTokens += modelOutputAudioTokens;
      requests += modelRequests;

      const previous = modelAccumulator.get(modelName);
      if (!previous) {
        modelAccumulator.set(modelName, {
          model: modelName,
          totalTokens: modelTotalTokens,
          inputTokens: modelInputTokens,
          outputTokens: modelOutputTokens,
          cachedInputTokens: modelCachedInputTokens,
          requests: modelRequests,
        });
        return;
      }

      modelAccumulator.set(modelName, {
        ...previous,
        totalTokens: previous.totalTokens + modelTotalTokens,
        inputTokens: previous.inputTokens + modelInputTokens,
        outputTokens: previous.outputTokens + modelOutputTokens,
        cachedInputTokens: previous.cachedInputTokens + modelCachedInputTokens,
        requests: previous.requests + modelRequests,
      });
    });

    const bucketEndTime =
      asNumber(bucket.end_time) ||
      (bucketWidth === "1h"
        ? bucketStartTime + 60 * 60
        : bucketStartTime + 24 * 60 * 60);

    timeline.push({
      startTime: toIsoFromUnix(bucketStartTime),
      endTime: toIsoFromUnix(bucketEndTime),
      totalTokens:
        inputTokens + outputTokens + inputAudioTokens + outputAudioTokens,
      inputTokens,
      outputTokens,
      cachedInputTokens,
      inputAudioTokens,
      outputAudioTokens,
      requests,
      cost:
        bucketWidth === "1d"
          ? (costByStartTime.get(bucketStartTime) ?? 0)
          : null,
      costBrl:
        bucketWidth === "1d" && typeof fx.usdToBrl === "number"
          ? (costByStartTime.get(bucketStartTime) ?? 0) * fx.usdToBrl
          : null,
    });
  });

  const sortedTimeline = timeline.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  const summary = sortedTimeline.reduce<OpenAIUsageSummary>(
    (acc, row) => ({
      totalTokens: acc.totalTokens + row.totalTokens,
      inputTokens: acc.inputTokens + row.inputTokens,
      outputTokens: acc.outputTokens + row.outputTokens,
      cachedInputTokens: acc.cachedInputTokens + row.cachedInputTokens,
      inputAudioTokens: acc.inputAudioTokens + row.inputAudioTokens,
      outputAudioTokens: acc.outputAudioTokens + row.outputAudioTokens,
      totalRequests: acc.totalRequests + row.requests,
      totalCost,
      totalCostBrl:
        typeof fx.usdToBrl === "number" ? totalCost * fx.usdToBrl : null,
      currency,
    }),
    {
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      cachedInputTokens: 0,
      inputAudioTokens: 0,
      outputAudioTokens: 0,
      totalRequests: 0,
      totalCost: 0,
      totalCostBrl: null,
      currency,
    },
  );

  const perModel = [...modelAccumulator.values()].sort(
    (a, b) => b.totalTokens - a.totalTokens,
  );

  return {
    projectId: OPENAI_USAGE_PROJECT_ID,
    projectName,
    period,
    bucketWidth,
    generatedAt: new Date().toISOString(),
    fx,
    summary,
    timeline: sortedTimeline,
    perModel,
  };
}

export async function GET(request: Request) {
  const authError = await getAdminApiAuthErrorResponse();
  if (authError) {
    return authError;
  }

  const openAIKey = getAdminOpenAIKey();
  if (!openAIKey) {
    return NextResponse.json(
      {
        error: "OpenAI admin key not configured",
        code: "OPENAI_ADMIN_KEY_NOT_CONFIGURED",
      },
      { status: 500 },
    );
  }

  try {
    const period = parsePeriod(request.url);
    const bucketWidth = BUCKET_WIDTH_BY_PERIOD[period];
    const now = Date.now();
    const endTime = Math.floor(now / 1000);
    const costsEndTime = getNextUtcDayStartUnix(now);
    const startTime = Math.floor((now - PERIOD_MS[period]) / 1000);
    const usageLimit = LIMIT_BY_PERIOD[period];
    const costLimit = COST_LIMIT_BY_PERIOD[period];

    const [usagePayload, costsPayload, fx] = await Promise.all([
      fetchOpenAIAdminEndpoint(
        "/v1/organization/usage/completions",
        {
          startTime,
          endTime,
          bucketWidth,
          limit: usageLimit,
          projectId: OPENAI_USAGE_PROJECT_ID,
          groupBy: ["project_id", "model"],
        },
        openAIKey,
      ),
      fetchOpenAIAdminEndpoint(
        "/v1/organization/costs",
        {
          startTime,
          endTime: costsEndTime,
          bucketWidth: "1d",
          limit: costLimit,
          projectId: OPENAI_USAGE_PROJECT_ID,
          groupBy: ["project_id"],
        },
        openAIKey,
      ),
      fetchUsdBrlRate(),
    ]);

    const snapshot = mapOpenAIUsageSnapshot(
      period,
      bucketWidth,
      usagePayload,
      costsPayload,
      fx,
    );

    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof OpenAIUpstreamError) {
      console.error("ADMIN_OPENAI_USAGE_UPSTREAM_ERROR:", error);

      if (error.status === 401 || error.status === 403) {
        return NextResponse.json(
          {
            error: "OpenAI key is invalid or does not have admin permissions",
            code: "OPENAI_USAGE_AUTH_FAILED",
            upstreamCode: error.upstreamCode,
          },
          { status: 502 },
        );
      }

      if (error.status === 429) {
        return NextResponse.json(
          {
            error: "OpenAI usage API rate limited",
            code: "OPENAI_USAGE_RATE_LIMITED",
            upstreamCode: error.upstreamCode,
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        {
          error: "Failed to fetch OpenAI usage",
          code: "OPENAI_USAGE_UPSTREAM_ERROR",
          upstreamCode: error.upstreamCode,
        },
        { status: 502 },
      );
    }

    console.error("ADMIN_OPENAI_USAGE_FETCH_ERROR:", error);
    return NextResponse.json(
      {
        error: "Failed to load OpenAI usage data",
        code: "ADMIN_OPENAI_USAGE_FETCH_ERROR",
      },
      { status: 500 },
    );
  }
}
