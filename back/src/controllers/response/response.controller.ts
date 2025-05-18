import { randomUUID } from 'node:crypto';

import { playerService } from '../../services/player/player.service.ts';
import { roomService } from '../../services/room/room.service.ts';
import { webSocketController } from '../webSocket/webSocket.controller.ts';
import { gameService } from '../../services/game/game.service.ts';
import { boardService } from '../../services/board/board.service.ts';

import { MAX_PLAYERS } from '../../common/constants.ts';

import type { AddShipsData, ClientRequest, RegistrationData } from '../../types/ClientRequest.ts';
import type { ClientResponse } from '../../types/ClientResponse.ts';
import type { Password, Player } from '../../types/Player.ts';
import type { CustomWebSocket } from '../../types/CustomWS.ts';
import type { Room } from '../../types/Room.ts';
import type { Ship } from '../../types/Ship.ts';
import type { Game } from '../../types/Game.ts';
import type { Board } from '../../types/Board.ts';

export const responseController = (clientRequest: ClientRequest, socket: CustomWebSocket) => {
  switch (clientRequest.type) {
    case 'reg': {
      const { name, password } = clientRequest.data as RegistrationData;
      const newPlayer: Player & Password = { name, password, id: randomUUID() };
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
      break;
    }
    case 'create_room': {
      const currentPlayer = socket.player;
      console.log('currentPlayer: ', currentPlayer);
      if (!currentPlayer) return;
      roomService.createNewRoomForPlayer(currentPlayer);
      roomService.updateRoom();
      break;
    }
    case 'add_user_to_room': {
      const { indexRoom } = clientRequest.data as {
        indexRoom: number | string;
      };
      console.log('indexRoom: ', indexRoom);
      const currentPlayer = socket.player;
      console.log('currentPlayer: ', currentPlayer);
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
      console.log('gameId: ', gameId);
      console.log('ships: ', ships);
      console.log('indexPlayer: ', indexPlayer);

      const currentGame: Game | undefined = gameService.getGameById(gameId);
      console.log('currentGame: ', currentGame);
      if (!currentGame) return;

      currentGame.ships.set(indexPlayer, ships);

      const currentBoard: Board = boardService.getEmptyBoard();

      ships.forEach((ship: Ship) => {
        const startX: number = ship.position.x;
        const startY: number = ship.position.y;

        console.log('ship: ', ship);
        console.log('startX: ', startX);
        console.log('startY: ', startY);

        let i = 0;
        while (i < ship.length) {
          console.log('i: ', i);

          const currentX: number = ship.direction ? startX : startX + i;
          const currentY: number = ship.direction ? startY + i : startY;

          console.log('currentX: ', currentX);
          console.log('currentY: ', currentY);

          currentBoard[currentX][currentY].boardShip = { ship, endurance: ship.length };

          i++;
        }
      });
      console.log('new board: ', JSON.stringify(currentBoard));
      currentGame.boards.set(indexPlayer, currentBoard);

      if (currentGame.boards.size >= MAX_PLAYERS) gameService.startGame(currentGame);
      break;
    }
    default:
      console.log('default!!!');
  }
};
