import { webSocketController } from '../webSocket/webSocket.controller.ts';

import { playersService } from '../../services/players/players.service.ts';

import type { ClientRequest, RegistrationData } from '../../types/ClientRequest.ts';
import type { ClientResponse } from '../../types/ClientResponse.ts';
import type { Player } from '../../types/Player.ts';

export const responseController = (clientRequest: ClientRequest) => {
  switch (clientRequest.type) {
    case 'reg': {
      const { name, password } = clientRequest.data as RegistrationData;
      const newPlayer: Player = { name, password };
      playersService.addPlayer(newPlayer);
      const newPlayerIndex = playersService.getLastPlayerIndex();

      const clientResponse: ClientResponse = {
        type: clientRequest.type,
        id: clientRequest.id,
        data: {
          name,
          index: newPlayerIndex,
          error: false,
          errorText: '',
        },
      };
      webSocketController.send(clientResponse);
      break;
    }
    default:
      console.log('default!!!');
  }
};
