import WebSocket from 'ws';

import { responseController } from '../response/response.controller.ts';

import type { ClientRequest } from '../../types/ClientRequest.ts';
import type { CustomWebSocket } from '../../types/CustomWS.ts';

export function clientMessagesController(this: WebSocket, clientMessage: string) {
  try {
    console.log('received: ', JSON.parse(clientMessage));
    const request: ClientRequest = JSON.parse(clientMessage) as ClientRequest;
    const { type, data, id } = request;
    const clientRequest: ClientRequest = { type, data: JSON.parse(String(data) || '{}'), id };

    responseController(clientRequest, this as CustomWebSocket);
  } catch (e) {
    console.error(e);
  }
}
