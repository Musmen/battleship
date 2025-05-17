import dotenv from 'dotenv';
dotenv.config();

import { startWebSocketServer } from './server.ts';

import { DEFAULT_PORT } from './common/constants.ts';

const port = Number(process.env.PORT ?? DEFAULT_PORT);

startWebSocketServer(port);
