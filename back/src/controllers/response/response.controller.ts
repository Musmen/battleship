import { randomUUID } from 'node:crypto';

import { playersService } from '../../services/players/players.service.ts';
import { roomsService } from '../../services/rooms/rooms.service.ts';
import { webSocketController } from '../webSocket/webSocket.controller.ts';

import type { ClientRequest, RegistrationData } from '../../types/ClientRequest.ts';
import type { ClientResponse } from '../../types/ClientResponse.ts';
import type { Password, Player } from '../../types/Player.ts';
import type { CustomWebSocket } from '../../types/CustomWS.ts';

export const responseController = (clientRequest: ClientRequest, socket: CustomWebSocket) => {
  switch (clientRequest.type) {
    case 'reg': {
      const { name, password } = clientRequest.data as RegistrationData;
      const newPlayer: Player & Password = { name, password, id: randomUUID() };
      playersService.addPlayer(newPlayer);
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
      roomsService.updateRoom();
      break;
    }
    case 'create_room': {
      const currentPlayer = socket.player;
      console.log('currentPlayer: ', currentPlayer);
      if (!currentPlayer) return;
      roomsService.createNewRoomForPlayer(currentPlayer);
      roomsService.updateRoom();
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
      roomsService.addUserToRoomByIndex(String(indexRoom), currentPlayer);
      roomsService.updateRoom();
      break;
    }
    default:
      console.log('default!!!');
  }
};
