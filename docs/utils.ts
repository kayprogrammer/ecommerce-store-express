import 'reflect-metadata';
import { plainToClass } from 'class-transformer';

function isPrimitiveType(metadataType: any): boolean {
  const primitiveTypes = ['String', 'Number', 'Boolean', 'Date', 'Symbol', 'BigInt', 'Array'];
  return primitiveTypes.includes(metadataType.name);
}

function generateSwaggerExampleFromSchema<T extends object>(cls: new () => T): Record<string, any> {
  const examples: Record<string, any> = {};
  
  const instance = plainToClass(cls, {}) as T;

  const keys = Object.keys(instance);

  keys.forEach((key) => {
    const example = Reflect.getMetadata('example', instance, key);
    const metadataType = Reflect.getMetadata('design:type', instance, key);
    // Check if it's a Buffer (binary data)
    if (metadataType && metadataType.name === 'Buffer') {
      examples[key] = {
        example: example,
        format: 'binary',
      };
    } 
    // Check if it's a class (not a primitive)
    else if (metadataType && !isPrimitiveType(metadataType)) {
      // If it's not a primitive, treat it as a class and generate example recursively
      examples[key] = generateSwaggerExampleFromSchema(metadataType as any);
    }
    // If it's a primitive type, treat it normally
    else if (metadataType && isPrimitiveType(metadataType)) {
      examples[key] = example;
    }
  });
  return examples
}

function generateSwaggerRequestExample<T extends object>(
  summary: string,
  schemaClass: new () => T,
  contentType: string = 'application/json'
): Record<string, any> {
  const examples = generateSwaggerExampleFromSchema(schemaClass);

  return {
      content: {
          [contentType]: {
              schema: {
                  type: 'object',
                  properties: Object.keys(examples).reduce((acc, key) => {
                    const example = examples[key]
                    const dataType = example instanceof Array ? "array" : typeof example
                    acc[key] = examples[key].format === 'binary'
                      ? { type: 'string', format: 'binary' } // Specify binary fields
                      : { type: dataType, example: examples[key] };
                    return acc;
                  }, {} as Record<string, any>),
              },
              examples: {
                  example1: {
                      summary: summary + ' body example',
                      value: examples,
                  },
              },
          },
      },
      required: true,
  };
}


function generateSwaggerExampleValue<T extends object>(summary: string, status: string, message: string, schemaClass?: (new () => T) | null, code?: string | null, isArray: boolean = false): Record<string, any> {
  const responseValue: any = {
    status: status,
    message: message,
    ...(code && { code: code }),
  }
  // If isArray is true, generate an array of examples
  if (isArray && schemaClass) {
    responseValue.data = [generateSwaggerExampleFromSchema(schemaClass as new () => T)];
  } else if (schemaClass) {
    responseValue.data = generateSwaggerExampleFromSchema(schemaClass as new () => T);
  }
  return {
    summary: summary,
    value: responseValue,
  }
}

function generateSwaggerResponseExample<T extends object>(description: string, status: string, message: string, schemaClass?: (new () => T) | null, code?: string | null, isArray: boolean = false): Record<string, any> {
  let exampleValue = generateSwaggerExampleValue("An example response", status, message, schemaClass, code, isArray)
  return {
    description: description,
    content: {
      'application/json': {
        examples: {
          example1: exampleValue,
        },
      },
    },
  }
}

function generateParamExample(name: string, description: string, type: string, example: any, location: "query" | "path" = "query"): Record<string,any>{
  let required = false
  if (location === "path") required = true
  return {
    name,
    in: location,
    required,
    description,
    schema: {
      type,
      example
    }
  }
}

function generatePaginationParamExample(objString: string): Record<string,any>[] {
  return [
    generateParamExample("page", `Current page of ${objString} to fetch`, "integer", 1),
    generateParamExample("limit", `Number of ${objString} per page to fetch`, "integer", 100),
  ]
}

export { generateSwaggerRequestExample, generateSwaggerResponseExample, generateSwaggerExampleValue, generateSwaggerExampleFromSchema, generateParamExample, generatePaginationParamExample }
