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
