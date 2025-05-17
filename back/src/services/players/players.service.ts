import type { Player } from '../../types/Player';

class PlayersService {
  private players: Player[] = [];

  addPlayer = (player: Player) => {
    this.players.push(player);
  };

  getLastPlayerIndex = () => this.players.length - 1;
}

export const playersService = new PlayersService();
