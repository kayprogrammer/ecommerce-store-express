import { ProfileEditSchema } from "../schemas/profiles";
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, SUCCESS_STATUS } from "./base";
import { generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils";

const tags = ["Profiles"]

const profileDocs = {
    get: {
        tags,
        summary: 'View Profile',
        description: `Allows authenticated users to view their profile`,
        security: [{ BearerAuth: [] }], // Require BearerAuth for this endpoint
        responses: {
            200: generateSwaggerResponseExample('Profile view successful response', SUCCESS_STATUS, "Profile Retrieved Successfully"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    },
    post: {
        tags,
        summary: 'Update Profile',
        description: `Allows authenticated users to update their profile`,
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Profile", ProfileEditSchema, "multipart/form-data"),
        responses: {
            200: generateSwaggerResponseExample('Profile update successful response', SUCCESS_STATUS, "Profile updated successful"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
};

export { profileDocs }