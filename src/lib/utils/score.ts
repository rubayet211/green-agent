function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function calculateFallbackScores(input: {
  tabs: number;
  hours: number;
  tasks: string;
}) {
  const tabPenalty = Math.min(input.tabs * 0.8, 35);
  const hourPenalty = Math.min(Math.max(input.hours - 4, 0) * 5, 35);
  const taskClarityBonus = input.tasks.trim().length > 30 ? 10 : 0;

  const focusScore = clamp(Math.round(85 - tabPenalty - hourPenalty + taskClarityBonus), 0, 100);
  const carbonScore = clamp(Math.round(90 - Math.min(input.tabs * 0.5, 25) - Math.min(input.hours * 3, 45)), 0, 100);

  return { focusScore, carbonScore };
}
