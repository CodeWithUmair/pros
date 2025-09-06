
import * as crypto from "crypto";

export const getNextExecutionDate = (recurrence: 'weekly' | 'monthly', isTestMode = false): Date => {
  const now = new Date();


  if (isTestMode) {
    const offsetMs =
      recurrence === "weekly" ? 2 * 60 * 1000 /* 2 min */ : 10 * 60 * 1000; /* 10 min */
    return new Date(now.getTime() + offsetMs);
  }

  let nextDate: Date;

  if (recurrence === 'weekly') {
    const dayOfWeek = now.getUTCDay(); // use UTC day
    const daysUntilNextMonday = (8 - dayOfWeek) % 7 || 7;
    const nextMonday = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysUntilNextMonday,
      0, 0, 0, 0 // midnight UTC
    ));
    nextDate = nextMonday;
  } else if (recurrence === 'monthly') {
    const nextMonth = now.getUTCMonth() + 1;
    const nextMonthStart = new Date(Date.UTC(
      now.getUTCFullYear(),
      nextMonth,
      1,
      0, 0, 0, 0 // midnight UTC
    ));
    nextDate = nextMonthStart;
  } else {
    throw new Error("Invalid recurrence type");
  }

  return nextDate;
};
export function generateSignature(
  timestamp: string,
  httpMethod: string,
  requestPath: string,
  secretKey: string,
  jsonString: string = ""
) {
  const signatureString = timestamp + httpMethod + requestPath + jsonString;
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(signatureString);
  const signature = hmac.digest("base64");
  return jsonString == "" ? encodeURIComponent(signature) : signature;
}

export function getStringToSign(params: Record<string, any>) {
  return Object.keys(params)
    .sort()
    .filter((key) => params[key] !== "" && !Array.isArray(params[key]))
    .map((key) => `${key}=${params[key]}`)
    .join("&");
}

export const formatMoney = (amount: number) =>
  `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

export const compact = (n: number) => {
  const abs = Math.abs(n);
  return abs >= 1e12
    ? (abs / 1e12).toFixed(1) + "T"
    : abs >= 1e9
      ? (abs / 1e9).toFixed(1) + "B"
      : abs >= 1e6
        ? (abs / 1e6).toFixed(1) + "M"
        : abs >= 1e3
          ? (abs / 1e3).toFixed(1) + "K"
          : String(abs);
};

/** Build a timestamp match object if from/to are provided */
export function buildTimeMatch(from?: string, to?: string) {
  const ts: Record<string, Date> = {};
  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) ts.$gte = d;
  }
  if (to) {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) ts.$lte = d;
  }
  return Object.keys(ts).length ? { timestamp: ts } : {};
}

export function fillMissingBuckets(
  chartData: { time: string; value: number }[],
  startDate: Date,
  endDate: Date,
  range: string
) {
  const filled: { time: string; value: number }[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    let label: string;

    if (range === "1D") {
      label = current.toISOString().slice(11, 13) + ":00"; // "HH:00"
      current.setHours(current.getHours() + 1);
    } else if (range === "7D" || range === "1M") {
      label = current.toISOString().slice(0, 10); // "YYYY-MM-DD"
      current.setDate(current.getDate() + 1);
    } else {
      // monthly buckets
      label = current
        .toLocaleString("en-US", { month: "short", year: "numeric" })
        .replace(" ", "-"); // "Aug-2025"
      current.setMonth(current.getMonth() + 1);
    }

    const found = chartData.find((d) => d.time === label);
    filled.push({
      time: label,
      value: found ? found.value : 0,
    });
  }

  // ✅ Make sure it’s chronological (oldest left → newest right)
  return filled.sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );
}
