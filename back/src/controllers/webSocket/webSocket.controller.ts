import { clientMessagesController } from '../clientMessages/clientMessages.controller.ts';

import { playerService } from '../../services/player/player.service.ts';
import { roomService } from '../../services/room/room.service.ts';

import type { ClientResponse } from '../../types/ClientResponse.ts';
import type { CustomWebSocket } from '../../types/CustomWS.ts';

class WebSocketController {
  private sockets: CustomWebSocket[] = [];

  private disconnectSocket = (socket: CustomWebSocket) => {
    if (!socket.player) return;
    const currentPlayerId = socket.player.id;
    playerService.removePlayerById(currentPlayerId);
    roomService.removePlayerFromRooms(currentPlayerId);
    roomService.removeEmptyRooms();
    roomService.updateRoom();
  };

  init = (socket: CustomWebSocket) => {
    this.sockets.push(socket);

    socket.on('error', (message) => {
      console.error('error: ', message);
      this.disconnectSocket(socket);
    });

    socket.on('close', (message) => {
      console.log('close: ', message);
      this.disconnectSocket(socket);
    });

    socket.on('message', clientMessagesController);
  };

  send = (clientResponse: ClientResponse, socket: CustomWebSocket) => {
    const serializedData = JSON.stringify(clientResponse.data);
    console.log('serializedData: ', serializedData);
    console.log(
      'serialized clientResponse: ',
      JSON.stringify({ ...clientResponse, data: serializedData })
    );
    socket.send(JSON.stringify({ ...clientResponse, data: serializedData }));
    console.log('send: ', JSON.stringify({ ...clientResponse, data: serializedData }));
  };

  broadcast = (clientResponse: ClientResponse) => {
    this.sockets.forEach((socket: CustomWebSocket) => {
      this.send(clientResponse, socket);
    });
  };
}

export const webSocketController = new WebSocketController();
