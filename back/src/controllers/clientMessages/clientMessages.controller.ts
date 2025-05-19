import WebSocket from 'ws';
import { styleText } from 'node:util';

import { responseController } from '../response/response.controller.ts';

import type { ClientRequest } from '../../types/ClientRequest.ts';
import type { CustomWebSocket } from '../../types/CustomWS.ts';

export function clientMessagesController(this: WebSocket, clientMessage: string) {
  try {
    const request: ClientRequest = JSON.parse(clientMessage) as ClientRequest;
    const { type, data, id } = request;
    console.log(styleText(['blue'], 'Received request: '), request);
    console.log(styleText(['blue'], 'Current command: '), type);
    const clientRequest: ClientRequest = { type, data: JSON.parse(String(data) || '{}'), id };

    responseController(clientRequest, this as CustomWebSocket);
  } catch (e) {
    console.error(e);
  }
}
