import { format } from 'date-fns';

/**
 * Format the given timestamp into a readable date format.
 * 
 * @param timestamp - The timestamp to format.
 * @param showTime - A flag to indicate whether to include the time.
 * @returns The formatted date, or "Today" if the date is today.
 */
const formatDate = (timestamp: string, showTime: boolean = true, showToday?: boolean): string => {
    const date = new Date(timestamp);
    const today = new Date();

    // Check if the date is today
    if (showToday && date.toDateString() === today.toDateString()) {
        return "Today"; // If it's today, return "Today"
    }

    // Format date to "Saturday, May 11, 2025"
    const formattedDate = format(date, "EEEE, MMMM dd, yyyy");

    // If showTime is true, append the time
    if (showTime) {
        const formattedTime = format(date, "hh:mm a");
        return `${formattedDate} at ${formattedTime}`; // Example: "Saturday, May 11, 2025 at 08:37 AM"
    }

    return formattedDate;
};

/**
 * Generates a map of token symbols to their mint addresses.
 * 
 * @param assets - An array of asset objects.
 * @returns An object mapping asset symbols to mint addresses.
 */
export function getTokenAddressMap(assets: any[]): { [key: string]: string } {
    if (!Array.isArray(assets)) return {};

    return assets.reduce((map, asset) => {
        if (asset.symbol && asset.mint) {
            map[asset.symbol] = asset.mint;
        }
        return map;
    }, {});
}

export const delay = (seconds: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};

export function formatNumber(number) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(number);
}

export default formatDate;

/** Format numbers as 26.5K / 26.5M / 26.5B / 26.5T.
 *  - Trims trailing ".0" (e.g. 26.0K -> 26K)
 *  - Preserves sign (e.g. -$1.2K)
 *  - `isCurrency` adds the symbol (default "$")
 */
export const formatNumberAndAmount = (
    num: number | null | undefined,
    isCurrency: boolean = false,
    opts?: { symbol?: string; decimals?: number; locale?: string }
) => {
    const symbol = opts?.symbol ?? "$";
    const decimals = opts?.decimals ?? 1;
    const locale = opts?.locale ?? "en-US";

    if (num === null || num === undefined || Number.isNaN(num)) {
        return isCurrency ? `${symbol}0` : "0";
    }

    const sign = num < 0 ? "-" : "";
    const abs = Math.abs(num);

    const formatCompact = (value: number, suffix: string) => {
        const s = value.toFixed(decimals).replace(/\.0+$/, ""); // trim trailing .0
        return `${s}${suffix}`;
    };

    let formatted: string;
    if (abs >= 1e12) {
        formatted = formatCompact(abs / 1e12, "T");
    } else if (abs >= 1e9) {
        formatted = formatCompact(abs / 1e9, "B");
    } else if (abs >= 1e6) {
        formatted = formatCompact(abs / 1e6, "M");
    } else if (abs >= 1e3) {
        formatted = formatCompact(abs / 1e3, "K");
    } else {
        // small numbers: use locale formatting, up to 2 decimals
        formatted = new Intl.NumberFormat(locale, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 0,
        }).format(abs);
    }

    return `${sign}${isCurrency ? symbol : ""}${formatted}`;
};