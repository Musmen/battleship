import { responseController } from '../response/response.controller.ts';

import { ClientRequest } from '../../types/ClientRequest.ts';

export const clientMessagesController = (clientMessage: string) => {
  try {
    console.log('received: ', JSON.parse(String(clientMessage)));
    const request: ClientRequest = JSON.parse(String(clientMessage)) as ClientRequest;
    const { type, data, id } = request;
    const clientRequest: ClientRequest = { type, data: JSON.parse(String(data) || '{}'), id };

    responseController(clientRequest);
  } catch (e) {
    console.error(e);
  }

  // {
  //   type: "reg",
  //   data:
  //       {
  //           name: <string>,
  //           password: <string>,
  //       },
  //   id: 0,
  // }
};
