import type { Ship } from './Ship';

export interface ClientRequest {
  type: string;
  data: unknown;
  id: number;
}

export interface RegistrationData {
  name: string;
  password: string;
}

export interface RegistrationError {
  isError: boolean;
  text: string;
}

export interface AddShipsData {
  gameId: number | string;
  ships: Ship[];
  indexPlayer: number | string;
}
