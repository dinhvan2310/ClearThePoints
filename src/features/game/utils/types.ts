export interface PointType {
  id: string;
  x: number;
  y: number;
  label: number;
}

export type GameState = 'idle' | 'running' | 'cleared' | 'failed';


