/**
 * Safe Inline Math & Expression Evaluator for Float Scratchpad
 * Evaluates expressions like:
 * - 45 * 12 =
 * - 15% of 850 =
 * - (100 + 50) / 2 =
 * - 2^8 =
 * - sqrt(144) =
 */

export interface MathResult {
  expression: string;
  result: number;
  formattedResult: string;
}

export function evaluateMathExpression(input: string): MathResult | null {
  if (!input || !input.includes('=')) return null;

  // Grab the text before the trailing '='
  const parts = input.split('=');
  if (parts.length < 2) return null;

  // The expression is the part right before the last '='
  const rawExpr = parts[parts.length - 2].trim();
  if (!rawExpr || rawExpr.length < 2) return null;

  // Handle "X% of Y" pattern
  const percentOfMatch = rawExpr.match(/^([\d.]+)\s*%\s+of\s+([\d.]+)$/i);
  if (percentOfMatch) {
    const pct = parseFloat(percentOfMatch[1]);
    const val = parseFloat(percentOfMatch[2]);
    if (!isNaN(pct) && !isNaN(val)) {
      const res = (pct / 100) * val;
      return {
        expression: rawExpr,
        result: res,
        formattedResult: formatNumber(res),
      };
    }
  }

  // Handle currency / dollar signs: "$150 + $30" -> "150 + 30"
  let sanitized = rawExpr.replace(/\$/g, '').trim();

  // Handle powers: e.g. 2^10 -> Math.pow(2, 10)
  sanitized = sanitized.replace(/(\d+(?:\.\d+)?)\s*\^\s*(\d+(?:\.\d+)?)/g, 'Math.pow($1, $2)');

  // Handle sqrt(X)
  sanitized = sanitized.replace(/sqrt\s*\(\s*([^)]+)\s*\)/gi, 'Math.sqrt($1)');

  // Whitelist only safe arithmetic characters: digits, operators (+, -, *, /, %, parentheses, decimal, Math.pow, Math.sqrt)
  const isSafe = /^[\d\s\+\-\*\/\%\(\)\.,Mathpowsqrt]+$/.test(sanitized);
  if (!isSafe) return null;

  try {
    // Safely evaluate using Function with strict bounds
    // eslint-disable-next-line no-new-func
    const evalFn = new Function(`return (${sanitized});`);
    const val = evalFn();

    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      return {
        expression: rawExpr,
        result: val,
        formattedResult: formatNumber(val),
      };
    }
  } catch {
    return null;
  }

  return null;
}

function formatNumber(num: number): string {
  // Check if it's an integer
  if (Number.isInteger(num)) {
    return num.toLocaleString();
  }
  // Otherwise format with up to 4 decimal places, stripping trailing zeros
  const fixed = num.toFixed(4);
  return parseFloat(fixed).toString();
}
