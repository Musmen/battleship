import type { Player } from '../../types/Player.ts';

class PlayersService {
  private players: Player[] = [];

  addPlayer = (player: Player) => {
    this.players.push(player);
  };

  removePlayerById = (id: string | number) => {
    this.players = this.players.filter((player: Player) => player.id !== id);
  };
}

export const playersService = new PlayersService();
