import { randomUUID } from 'node:crypto';

import { playerService } from '../../services/player/player.service.ts';
import { roomService } from '../../services/room/room.service.ts';
import { webSocketController } from '../webSocket/webSocket.controller.ts';
import { gameService } from '../../services/game/game.service.ts';
import { boardService } from '../../services/board/board.service.ts';

import { getRandomNumber } from '../../common/helpers.ts';

import { BOARD_SIZE, MAX_PLAYERS } from '../../common/constants.ts';

import type { ClientResponse } from '../../types/ClientResponse.ts';
import type { Password, Player } from '../../types/Player.ts';
import type { CustomWebSocket } from '../../types/CustomWS.ts';
import type { Room } from '../../types/Room.ts';
import type { Ship } from '../../types/Ship.ts';
import type { Game } from '../../types/Game.ts';
import type { Board } from '../../types/Board.ts';
import type {
  AddShipsData,
  AttackData,
  ClientRequest,
  RandomAttackData,
  RegistrationData,
} from '../../types/ClientRequest.ts';

export const responseController = (clientRequest: ClientRequest, socket: CustomWebSocket) => {
  switch (clientRequest.type) {
    case 'reg': {
      const { name, password } = clientRequest.data as RegistrationData;

      if (!playerService.isValidPlayer(name, password)) return;

      const newPlayer: Player & Password = { name, password, id: randomUUID(), wins: 0 };
      playerService.addPlayer(newPlayer);
      socket.player = newPlayer;

      const clientResponse: ClientResponse = {
        type: clientRequest.type,
        id: clientRequest.id,
        data: {
          name,
          id: newPlayer.id,
          error: false,
          errorText: '',
        },
      };
      webSocketController.send(clientResponse, socket);
      roomService.updateRoom();
      gameService.updateWinners(playerService.getPlayers());
      break;
    }
    case 'create_room': {
      const currentPlayer = socket.player;
      if (!currentPlayer) return;
      roomService.createNewRoomForPlayer(currentPlayer);
      roomService.updateRoom();
      break;
    }
    case 'add_user_to_room': {
      const { indexRoom } = clientRequest.data as {
        indexRoom: number | string;
      };
      const currentPlayer = socket.player;
      if (!currentPlayer || !indexRoom) return;

      const currentRoom: Room | undefined = roomService.getRoomByIndex(String(indexRoom));
      roomService.addUserToRoom(currentRoom, currentPlayer);
      roomService.updateRoom();

      if (roomService.roomReadyToStartGame(currentRoom))
        gameService.createNewGameForPlayers(currentRoom?.players);
      break;
    }
    case 'add_ships': {
      const { gameId, ships, indexPlayer } = clientRequest.data as AddShipsData;

      const currentGame: Game | undefined = gameService.getGameById(gameId);
      if (!currentGame) return;

      currentGame.ships.set(indexPlayer, ships);

      const currentBoard: Board = boardService.getEmptyBoard();

      ships.forEach((ship: Ship) => {
        const startX: number = ship.position.x;
        const startY: number = ship.position.y;

        let i = 0;
        while (i < ship.length) {
          const currentX: number = ship.direction ? startX : startX + i;
          const currentY: number = ship.direction ? startY + i : startY;

          currentBoard[currentX][currentY].boardShip = { ship, endurance: ship.length };

          i++;
        }
      });
      currentGame.boards.set(indexPlayer, currentBoard);

      if (currentGame.boards.size >= MAX_PLAYERS) gameService.startGame(currentGame);
      break;
    }
    case 'attack': {
      const { gameId, x, y, indexPlayer } = clientRequest.data as AttackData;
      gameService.calculateAttack(gameId, x, y, indexPlayer);
      break;
    }
    case 'randomAttack': {
      const { gameId, indexPlayer } = clientRequest.data as RandomAttackData;

      const x = getRandomNumber(BOARD_SIZE);
      const y = getRandomNumber(BOARD_SIZE);

      gameService.calculateAttack(gameId, x, y, indexPlayer);
      break;
    }
    default:
      console.error('Unknown command received...');
  }
};
