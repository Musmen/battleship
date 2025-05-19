import { randomUUID } from 'node:crypto';

import { webSocketController } from '../../controllers/webSocket/webSocket.controller.ts';

import type { Game } from '../../types/Game.ts';
import type { Player } from '../../types/Player.ts';
import type { ClientResponse } from '../../types/ClientResponse.ts';
import type { Board } from '../../types/Board.ts';
import type { Ship } from '../../types/Ship.ts';

class GameService {
  private games: Game[] = [];

  private nextPlayer = new Map<number | string, number | string>();

  private addGame = (game: Game) => {
    this.games.push(game);
  };

  getGameById = (id: number | string) => this.games.find((game: Game) => game.id === id);

  createNewGameForPlayers = (players: Player[] | undefined) => {
    if (!players?.length) return;

    const newGame: Game = {
      players,
      id: randomUUID(),
      boards: new Map<string | number, Board>(),
      ships: new Map<string | number, Ship[]>(),
    };

    this.addGame(newGame);

    players.forEach((player: Player) => {
      const socket = webSocketController.getPlayerSocket(player);
      if (!socket) return;
      const clientResponse: ClientResponse = {
        type: 'create_game',
        id: 0,
        data: { idGame: newGame.id, idPlayer: player.id },
      };
      webSocketController.send(clientResponse, socket);
    });
  };

  startGame = (currentGame: Game) => {
    const { players } = currentGame;

    if (!players.length) return;

    players.forEach((player: Player) => {
      const socket = webSocketController.getPlayerSocket(player);
      if (!socket) return;
      const clientResponse: ClientResponse = {
        type: 'start_game',
        id: 0,
        data: { ships: currentGame.ships.get(player.id), currentPlayerIndex: player.id },
      };
      webSocketController.send(clientResponse, socket);
    });

    this.sendTurn(currentGame.id, players);
  };

  sendTurn = (gameId: number | string, players: Player[], currentPlayerIndex?: number | string) => {
    const nextPlayerId = currentPlayerIndex
      ? players.find((player) => player.id !== currentPlayerIndex)?.id
      : players[0].id;

    if (!nextPlayerId) return;

    this.nextPlayer.set(gameId, nextPlayerId);

    players.forEach((player: Player) => {
      const socket = webSocketController.getPlayerSocket(player);
      if (!socket) return;

      const clientResponse: ClientResponse = {
        type: 'turn',
        id: 0,
        data: { currentPlayer: nextPlayerId },
      };
      webSocketController.send(clientResponse, socket);
    });
  };

  calculateAttack = (
    gameId: number | string,
    x: number,
    y: number,
    indexPlayer: number | string
  ) => {
    const currentGame: Game | undefined = this.getGameById(gameId);
    if (!currentGame) return;

    const nextPlayerId = this.nextPlayer.get(gameId);
    if (nextPlayerId !== indexPlayer) return;

    const enemyId = currentGame.players.find((player) => player.id != indexPlayer)?.id;
    if (!enemyId) return;

    const currentBoard = currentGame.boards.get(String(enemyId));
    if (!currentBoard) return;

    currentBoard[x][y].status = currentBoard[x][y].boardShip ? 'shot' : 'miss'; // TODO логика проверки убит ли корабль и т.д.

    currentGame.players.forEach((player: Player) => {
      const socket = webSocketController.getPlayerSocket(player);
      if (!socket) return;

      const clientResponse: ClientResponse = {
        type: 'attack',
        id: 0,
        data: {
          position: {
            x,
            y,
          },
          currentPlayer: indexPlayer,
          status: currentBoard[x][y].status,
          // status: 'miss' | 'killed' | 'shot',
        },
      };
      webSocketController.send(clientResponse, socket);
    });

    if (currentBoard[x][y].status === 'miss')
      this.sendTurn(gameId, currentGame.players, indexPlayer);
  };
}

export const gameService = new GameService();
