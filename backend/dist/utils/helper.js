"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.compact = exports.formatMoney = exports.getNextExecutionDate = void 0;
exports.generateSignature = generateSignature;
exports.getStringToSign = getStringToSign;
exports.buildTimeMatch = buildTimeMatch;
exports.fillMissingBuckets = fillMissingBuckets;
const crypto = __importStar(require("crypto"));
const getNextExecutionDate = (recurrence, isTestMode = false) => {
    const now = new Date();
    if (isTestMode) {
        const offsetMs = recurrence === "weekly" ? 2 * 60 * 1000 /* 2 min */ : 10 * 60 * 1000; /* 10 min */
        return new Date(now.getTime() + offsetMs);
    }
    let nextDate;
    if (recurrence === 'weekly') {
        const dayOfWeek = now.getUTCDay(); // use UTC day
        const daysUntilNextMonday = (8 - dayOfWeek) % 7 || 7;
        const nextMonday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilNextMonday, 0, 0, 0, 0 // midnight UTC
        ));
        nextDate = nextMonday;
    }
    else if (recurrence === 'monthly') {
        const nextMonth = now.getUTCMonth() + 1;
        const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), nextMonth, 1, 0, 0, 0, 0 // midnight UTC
        ));
        nextDate = nextMonthStart;
    }
    else {
        throw new Error("Invalid recurrence type");
    }
    return nextDate;
};
exports.getNextExecutionDate = getNextExecutionDate;
function generateSignature(timestamp, httpMethod, requestPath, secretKey, jsonString = "") {
    const signatureString = timestamp + httpMethod + requestPath + jsonString;
    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(signatureString);
    const signature = hmac.digest("base64");
    return jsonString == "" ? encodeURIComponent(signature) : signature;
}
function getStringToSign(params) {
    return Object.keys(params)
        .sort()
        .filter((key) => params[key] !== "" && !Array.isArray(params[key]))
        .map((key) => `${key}=${params[key]}`)
        .join("&");
}
const formatMoney = (amount) => `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
exports.formatMoney = formatMoney;
const compact = (n) => {
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
exports.compact = compact;
/** Build a timestamp match object if from/to are provided */
function buildTimeMatch(from, to) {
    const ts = {};
    if (from) {
        const d = new Date(from);
        if (!Number.isNaN(d.getTime()))
            ts.$gte = d;
    }
    if (to) {
        const d = new Date(to);
        if (!Number.isNaN(d.getTime()))
            ts.$lte = d;
    }
    return Object.keys(ts).length ? { timestamp: ts } : {};
}
function fillMissingBuckets(chartData, startDate, endDate, range) {
    const filled = [];
    const current = new Date(startDate);
    while (current <= endDate) {
        let label;
        if (range === "1D") {
            label = current.toISOString().slice(11, 13) + ":00"; // "HH:00"
            current.setHours(current.getHours() + 1);
        }
        else if (range === "7D" || range === "1M") {
            label = current.toISOString().slice(0, 10); // "YYYY-MM-DD"
            current.setDate(current.getDate() + 1);
        }
        else {
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
    return filled.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}
