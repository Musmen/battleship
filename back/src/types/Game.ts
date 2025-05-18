import type { Board } from './Board';
import type { Player } from './Player';
import type { Ship } from './Ship';

export interface Game {
  players: Player[];
  id: number | string;
  boards: Map<string | number, Board>;
  ships: Map<string | number, Ship[]>;
}
