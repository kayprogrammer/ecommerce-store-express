import { SiteDetailSchema } from "../schemas/general";
import { generateSwaggerResponseExample } from "./utils";
import { ERROR_EXAMPLE_500, SUCCESS_STATUS } from "./base";

export const siteDetailDocs = {
    get: {
        tags: ['General (1)'],
        summary: 'Get site details',
        description: "Fetch details about the site like name, email, address, etc.",
        responses: {
            200: generateSwaggerResponseExample('Successful response', SUCCESS_STATUS, "Site details fetched", SiteDetailSchema),
            500: ERROR_EXAMPLE_500
        }
    }
};