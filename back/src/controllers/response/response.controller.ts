import { ClientRequest, RegistrationData } from '../../types/ClientRequest.ts';
import { ClientResponse } from '../../types/ClientResponse.ts';
import { webSocketController } from '../webSocket/webSocket.controller.ts';

export const responseController = (clientRequest: ClientRequest) => {
  switch (clientRequest.type) {
    //   {
    //     type: "reg",
    //     data:
    //         {
    //             name: <string>,
    //             index: <number | string>,
    //             error: <bool>,
    //             errorText: <string>,
    //         },
    //     id: 0,
    //   }
    case 'reg': {
      const name: string = (clientRequest.data as RegistrationData).name;
      const clientResponse: ClientResponse = {
        type: clientRequest.type,
        id: clientRequest.id,
        data: {
          name,
          index: 0,
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
