import { IncomingMessage } from 'node:http';
import { styleText } from 'node:util';

import WebSocket, { WebSocketServer } from 'ws';

import { webSocketController } from './controllers/webSocket/webSocket.controller.ts';
import type { CustomWebSocket } from './types/CustomWS.ts';

const closeAllConnections = (activeClients: Set<WebSocket>) => {
  activeClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.close(1001, 'Server shutdown');
    }
    activeClients.delete(client);
  });
};

export const startWebSocketServer = (port: number) => {
  const wss = new WebSocketServer({ port });
  const activeClients = new Set<WebSocket>();

  console.log(
    styleText(
      ['blue'],
      `WebSocket Server started with parameters:
    - Port: ${String(port)}
    - Path: ${wss.options.path ?? '/'}
    - Max payload: ${String(wss.options.maxPayload)} bytes`
    )
  );

  wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
    const ip = String(request.socket.remoteAddress);

    activeClients.add(ws);
    console.log(
      styleText(
        ['blue'],
        `New client connected:
    - IP: ${ip}
    - User-Agent: ${String(request.headers['user-agent'])}`
      )
    );

    webSocketController.init(ws as CustomWebSocket);

    ws.on('close', () => {
      activeClients.delete(ws);
    });

    ws.on('error', () => {
      activeClients.delete(ws);
      ws.terminate();
    });
  });

  wss.on('error', (error) => {
    closeAllConnections(activeClients);
    console.log(styleText(['blue'], 'WebSocket server error: '), error);
  });

  wss.on('close', () => {
    closeAllConnections(activeClients);
    console.log(styleText(['blue'], 'WebSocket server closed'));
  });
};
