import { Player } from './Player';

export interface Room {
  players: Player[];
  id: number | string;
}
