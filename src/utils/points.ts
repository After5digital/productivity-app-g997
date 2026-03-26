import { POINTS_PER_TASK, HIGH_PRIORITY_MULTIPLIER, POINTS_PER_LEVEL } from '../constants';
import type { Priority } from '../types';

export function calculateTaskPoints(priority: Priority, timeEstimate: number): number {
  const timeBonus = Math.floor(timeEstimate / 30) * 2;
  const base = POINTS_PER_TASK + timeBonus;
  return priority === 'high' ? Math.floor(base * HIGH_PRIORITY_MULTIPLIER) : base;
}

export function getLevelFromPoints(points: number): number {
  return Math.floor(points / POINTS_PER_LEVEL) + 1;
}

export function getPointsToNextLevel(points: number): number {
  const currentLevel = getLevelFromPoints(points);
  return currentLevel * POINTS_PER_LEVEL - points;
}

export function getLevelProgress(points: number): number {
  const currentLevel = getLevelFromPoints(points);
  const levelStart = (currentLevel - 1) * POINTS_PER_LEVEL;
  return ((points - levelStart) / POINTS_PER_LEVEL) * 100;
}
