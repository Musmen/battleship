import { randomUUID } from 'node:crypto';

import { webSocketController } from '../../controllers/webSocket/webSocket.controller.ts';
import { playerService } from '../player/player.service.ts';
import { BOARD_SIZE } from '../../common/constants.ts';

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
    let isKilled = false;

    const currentGame: Game | undefined = this.getGameById(gameId);
    if (!currentGame) return;

    const nextPlayerId = this.nextPlayer.get(gameId);
    if (nextPlayerId !== indexPlayer) return;

    const enemyId = currentGame.players.find((player) => player.id != indexPlayer)?.id;
    if (!enemyId) return;

    const currentBoard = currentGame.boards.get(String(enemyId));
    if (!currentBoard) return;

    const isShotRepeated = Boolean(currentBoard[x][y].status);

    if (!isShotRepeated) {
      if (currentBoard[x][y].boardShip) {
        const { ship } = currentBoard[x][y].boardShip;
        const startX: number = ship.position.x;
        const startY: number = ship.position.y;

        let i = 0;
        while (i < ship.length) {
          const currentX: number = ship.direction ? startX : startX + i;
          const currentY: number = ship.direction ? startY + i : startY;

          if (!currentBoard[currentX][currentY].boardShip) return;
          currentBoard[currentX][currentY].boardShip.endurance -= 1;

          i++;
        }

        if (currentBoard[x][y].boardShip.endurance > 0) {
          currentBoard[x][y].status = 'shot';
        } else {
          currentBoard[x][y].status = 'killed';
          isKilled = true;
        }
      } else {
        currentBoard[x][y].status = 'miss';
      }
    }

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
        },
      };
      webSocketController.send(clientResponse, socket);
    });

    if (isKilled && currentBoard[x][y].boardShip) {
      const { ship } = currentBoard[x][y].boardShip;
      const startX: number = ship.position.x;
      const startY: number = ship.position.y;

      let i = 0;
      while (i < ship.length) {
        const currentX: number = ship.direction ? startX : startX + i;
        const currentY: number = ship.direction ? startY + i : startY;

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const missX = currentX + dx;
            const missY = currentY + dy;

            if (missX >= 0 && missX <= BOARD_SIZE - 1 && missY >= 0 && missY <= BOARD_SIZE - 1) {
              currentGame.players.forEach((player: Player) => {
                const socket = webSocketController.getPlayerSocket(player);
                if (!socket) return;

                const clientResponse: ClientResponse = {
                  type: 'attack',
                  id: 0,
                  data: {
                    position: {
                      x: missX,
                      y: missY,
                    },
                    currentPlayer: indexPlayer,
                    status: currentBoard[missX][missY].status ?? 'missed',
                  },
                };
                webSocketController.send(clientResponse, socket);
              });
            }
          }
        }
        i++;
      }
    }

    if (isKilled) {
      let isGameFinished = true;

      for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
          const { boardShip } = currentBoard[x][y];
          if (boardShip && boardShip.endurance > 0) isGameFinished = false;
        }
      }

      if (isGameFinished) {
        this.finishGame(currentGame.players, indexPlayer);
        return;
      }
    }

    if (currentBoard[x][y].status === 'miss' || isShotRepeated)
      this.sendTurn(gameId, currentGame.players, indexPlayer);
  };

  finishGame = (players: Player[], winPlayerId: number | string) => {
    players.forEach((player: Player) => {
      const socket = webSocketController.getPlayerSocket(player);
      if (!socket) return;

      const clientResponse: ClientResponse = {
        type: 'finish',
        id: 0,
        data: {
          winPlayer: winPlayerId,
        },
      };
      webSocketController.send(clientResponse, socket);
    });
    playerService.updateWinPlayer(winPlayerId);
    this.updateWinners(players);
  };

  updateWinners = (players: Player[]) => {
    players.forEach((player: Player) => {
      const socket = webSocketController.getPlayerSocket(player);
      if (!socket) return;

      const clientResponse: ClientResponse = {
        type: 'update_winners',
        id: 0,
        data: playerService.getWinnersData(),
      };
      webSocketController.send(clientResponse, socket);
    });
  };
}

export const gameService = new GameService();
