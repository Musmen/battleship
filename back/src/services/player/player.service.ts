import { USER_NAME_MIN_LENGTH, USER_PASSWORD_MIN_LENGTH } from '../../common/constants.ts';
import type { Player } from '../../types/Player.ts';

class PlayerService {
  private players: Player[] = [];

  addPlayer = (player: Player) => {
    this.players.push(player);
  };

  removePlayerById = (id: string | number) => {
    this.players = this.players.filter((player: Player) => player.id !== id);
  };

  isValidPlayer = (name: string, password: string) =>
    name.length >= USER_NAME_MIN_LENGTH && password.length >= USER_PASSWORD_MIN_LENGTH;

  updateWinPlayer = (id: string | number) => {
    const winPlayerIndex = this.players.findIndex((player: Player) => player.id === id);
    this.players[winPlayerIndex].wins++;
  };

  getWinnersData = () => {
    return this.players.map((player) => ({ name: player.name, wins: player.wins }));
  };

  getPlayers = () => this.players;
}

export const playerService = new PlayerService();
