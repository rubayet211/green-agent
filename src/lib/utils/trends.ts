interface TrendOptions {
  width: number;
  height: number;
  padding: number;
}

export type TrendDirection = "up" | "down" | "flat";

export function buildTrendPolyline(scores: number[], options: TrendOptions) {
  const values = scores.map((score) => Math.max(0, Math.min(100, score)));
  const innerWidth = options.width - options.padding * 2;
  const innerHeight = options.height - options.padding * 2;
  const points = values
    .map((score, index) => {
      const x =
        values.length === 1
          ? options.width / 2
          : options.padding + (innerWidth * index) / (values.length - 1);
      const y = options.padding + innerHeight * (1 - score / 100);
      return `${Math.round(x)},${Math.round(y)}`;
    })
    .join(" ");
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? first;
  const direction: TrendDirection =
    last > first ? "up" : last < first ? "down" : "flat";

  return { points, direction };
}
