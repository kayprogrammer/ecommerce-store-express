import { plainToInstance } from "class-transformer";

type ResponseBase = {
  message: string;
  status: string;
  code?: string; // Optional error code
};

export class CustomResponse {
  static success<T, U, V extends T | undefined>(
    message: string,
    data?: U | U[],
    dataSchema?: new () => V
  ): ResponseBase & { data?: T } {
    let response: ResponseBase & { data?: T } = {
      status: "success",
      message
    };

    if (dataSchema && data !== undefined) {
      response.data = plainToInstance(dataSchema, data, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }) as T; // Type assertion to ensure compatibility
    } else {
      response.data = data as T;
    }
    return response;
  }

  static error(message: string, code: string, data?: Record<string,any>): ResponseBase {
    var resp: ResponseBase & { data?: Record<string,any> } = {
      status: "failure",
      code,
      message,
    };
    if (data) resp.data = data
    return resp
  }
}

export const randomStr = (length: number): string => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset.charAt(randomIndex);
  }

  return randomString;
}

export const setDictAttr = (from: Record<string,any>, to: Record<string,any>): Record<string,any> => {
  for (var key in from){
    to[key] = from[key]
  }
  return to
}

export function getRandomItem<T>(items: T[]): T {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}