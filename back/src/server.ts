import { IncomingMessage } from 'node:http';

import WebSocket, { WebSocketServer } from 'ws';

import { webSocketController } from './controllers/webSocket/webSocket.controller.ts';
import type { CustomWebSocket } from './types/CustomWS.ts';

export const startWebSocketServer = (port: number) => {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
    const ip = request.socket.remoteAddress;
    console.log('ip: ', ip);

    webSocketController.init(ws as CustomWebSocket);
  });

  wss.on('error', (error) => {
    console.log('WebSocket server error: ', error);
  });

  wss.on('close', () => {
    console.log('WebSocket server closed');
  });
};
