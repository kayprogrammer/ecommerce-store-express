import { Expose } from "class-transformer";
import { Example } from "./utils";
import { IsEmail } from "class-validator";

export class ResponseSchema {
    status: "success" | "failure" = "success";
    message?: string;
}

export class EmailSchema {
    @Expose()
    @Example("johndoe@example.com")
    @IsEmail({}, {message: "Enter a valid email address"})
    email?: string
}

export class UserSchema {
    @Expose()
    @Example("John Doe")
    name?: string

    @Expose()
    @Example("john-doe")
    username?: string

    @Expose()
    @Example("https://img.com/john")
    avatarUrl?: string
}

export class FileUploadDataSchema {
    @Expose()
    @Example("5f47ac29e7d1b644a81e1e1a")
    publicId?: string

    @Expose()
    @Example("mE4BQwZ9q6R7aDgI56m8Nx5Vx4U")
    signature?: string

    @Expose()
    @Example("1638307200")
    timestamp?: string
}

export class UnprocessableSchema {
    @Expose()
    @Example("This field is required")
    field1?: string

    @Expose()
    @Example("Ensure this is a valid type")
    field2?: string
}

export class PaginatedResponseSchema {
    @Expose()
    @Example(1)
    page?: number

    @Expose()
    @Example(100)
    itemsCount?: number

    @Expose()
    @Example(2)
    totalPages?: number

    @Expose()
    @Example(50)
    itemsPerPage?: number
}

const IMAGE_EXAMPLE = "https://image.com/whatever"
const DATETIME_EXAMPLE = "2024-09-22T14:30:00Z"
const ID_EXAMPLE = "507f1f77bcf86cd799439011"
export { IMAGE_EXAMPLE, DATETIME_EXAMPLE, ID_EXAMPLE }