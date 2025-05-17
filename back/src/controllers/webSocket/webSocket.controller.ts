import WebSocket from 'ws';

import { clientMessagesController } from '../clientMessages/clientMessages.controller.ts';

import { ClientResponse } from '../../types/ClientResponse.ts';

class WebSocketController {
  private socket: WebSocket | null = null;

  init = (socket: WebSocket) => {
    this.socket = socket;

    this.socket.on('error', (message) => {
      console.error('error: ', message);
    });

    this.socket.on('message', clientMessagesController);
  };

  send = (clientResponse: ClientResponse) => {
    const serializedData = JSON.stringify(clientResponse.data);
    this.socket?.send(JSON.stringify({ ...clientResponse, data: serializedData }));
    console.log('send: ', JSON.stringify({ ...clientResponse, data: serializedData }));
  };
}

export const webSocketController = new WebSocketController();
