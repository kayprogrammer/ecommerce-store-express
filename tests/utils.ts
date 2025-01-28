import { plainToInstance } from "class-transformer"

const BASE_URL = "/api/v2"

const convertSchemaData = <T, U, V extends T>(dataSchema: new () => V, data: U | U[]): any => {
    return plainToInstance(dataSchema, data, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    }) as any
}

export { BASE_URL, convertSchemaData }