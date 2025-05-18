import type { Ship } from './Ship';

export type Board = BoardCell[][];

export interface BoardCell {
  position: {
    x: number;
    y: number;
  };
  status: 'miss' | 'killed' | 'shot' | null;
  boardShip: BoardShip | null;
}

export interface BoardShip {
  ship: Ship;
  endurance: number;
}
