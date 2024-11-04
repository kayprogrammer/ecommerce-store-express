import { ErrorCode } from "../config/handlers" 
import { UnprocessableSchema } from "../schemas/base"
import { generateSwaggerExampleValue, generateSwaggerResponseExample } from "./utils"

const SUCCESS_STATUS = 'success'
const FAILURE_STATUS = 'failure'
const ERROR_EXAMPLE_500 = generateSwaggerResponseExample(
    'Server Error response', 
    FAILURE_STATUS, 
    "Server Error", 
    null, ErrorCode.SERVER_ERROR
)
const ERROR_EXAMPLE_422 = generateSwaggerResponseExample(
    'Unprocessable entity response', 
    FAILURE_STATUS, 
    "Invalid Entry", 
    UnprocessableSchema, ErrorCode.INVALID_ENTRY
)
const ERROR_EXAMPLE_UNAUTHORIZED_USER = generateSwaggerResponseExample(
    'Unauthorized User', 
    FAILURE_STATUS, 
    "Unauthorized user", 
    null, ErrorCode.UNAUTHORIZED_USER
)
const ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN = {
    ...ERROR_EXAMPLE_UNAUTHORIZED_USER,
    content: {
        'application/json': {
            examples: {
                example1: ERROR_EXAMPLE_UNAUTHORIZED_USER.content["application/json"].examples.example1,
                example2: generateSwaggerExampleValue(
                    "Invalid Access Token",
                    FAILURE_STATUS,
                    "Access token is invalid or expired",
                    null,
                    ErrorCode.INVALID_TOKEN
                ),
            },
        },
    },
};

const ERROR_EXAMPLE_UNAUTHORIZED_ADMIN = {
    ...ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
    content: {
        'application/json': {
            examples: {
                example1: ERROR_EXAMPLE_UNAUTHORIZED_USER.content["application/json"].examples.example1,
                example2: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN.content["application/json"].examples.example2,
                example3: generateSwaggerExampleValue(
                    "Invalid Admin",
                    FAILURE_STATUS,
                    "For Admins only",
                    null,
                    ErrorCode.ADMINS_ONLY
                ),
            },
        },
    },
};
export { SUCCESS_STATUS, FAILURE_STATUS, ERROR_EXAMPLE_500, ERROR_EXAMPLE_422, ERROR_EXAMPLE_UNAUTHORIZED_USER, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, ERROR_EXAMPLE_UNAUTHORIZED_ADMIN };