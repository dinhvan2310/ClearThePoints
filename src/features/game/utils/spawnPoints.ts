import { POINT_RADIUS_PX } from './constants';
import type { PointType } from './types';

export function spawnPoints(count: number, width: number, height: number): PointType[] {
  const points: PointType[] = [];
  const minX = POINT_RADIUS_PX;
  const minY = POINT_RADIUS_PX;
  const maxX = Math.max(minX + 1, width - POINT_RADIUS_PX);
  const maxY = Math.max(minY + 1, height - POINT_RADIUS_PX);

  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * (maxX - minX)) + minX;
    const y = Math.floor(Math.random() * (maxY - minY)) + minY;
    points.push({ 
      id: `${Date.now()}_${i}`, 
      x, 
      y, 
      label: i + 1, 
    });
  }

  return points;
}


