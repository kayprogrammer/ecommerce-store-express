export class ErrorCode {
    static readonly UNAUTHORIZED_USER = "unauthorized_user";
    static readonly NETWORK_FAILURE = "network_failure";
    static readonly SERVER_ERROR = "server_error";
    static readonly INVALID_ENTRY = "invalid_entry";
    static readonly INCORRECT_EMAIL = "incorrect_email";
    static readonly INVALID_OTP = "invalid_otp";
    static readonly INVALID_AUTH = "invalid_auth";
    static readonly INVALID_TOKEN = "invalid_token";
    static readonly INVALID_CREDENTIALS = "invalid_credentials";
    static readonly UNVERIFIED_USER = "unverified_user";
    static readonly NON_EXISTENT = "non_existent";
    static readonly INVALID_OWNER = "invalid_owner";
    static readonly INVALID_PAGE = "invalid_page";
    static readonly INVALID_VALUE = "invalid_value";
    static readonly NOT_ALLOWED = "not_allowed";
    static readonly INVALID_DATA_TYPE = "invalid_data_type";
    static readonly ADMINS_ONLY = "admins_only";
    static readonly BAD_REQUEST = "bad_request";
    static readonly UNPROCESSABLE_ENTITY = "unprocessable_entity";
}

export class RequestError extends Error {
    status: number;
    code: string;
    data?: any;

    constructor(message: string, status: number, code: string, data?: any) {
        super(message);
        this.status = status;
        this.code = code;
        this.data = data;

        // Set the prototype explicitly to maintain instanceof behavior
        Object.setPrototypeOf(this, RequestError.prototype);

        // Capture the stack trace (if available)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export class ValidationErr extends RequestError {
    constructor(field: string, field_message: string) {
        let message = "Invalid Entry"
        let data = {[field]: field_message}
        super(message, 422, ErrorCode.INVALID_ENTRY, data);
    }
}

// Other specific error classes can also use ErrorCode constants
export class UnauthorizedError extends RequestError {
    constructor(message: string) {
        super(message, 401, ErrorCode.UNAUTHORIZED_USER);
    }
}

export class NotFoundError extends RequestError {
    constructor(message: string) {
        super(message, 404, ErrorCode.NON_EXISTENT);
    }
}

export class ServerErr extends RequestError {
    constructor(message: string = "Server Error") {
        super(message, 500, ErrorCode.SERVER_ERROR);
    }
}
