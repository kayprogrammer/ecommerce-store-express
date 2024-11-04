import { Expose, Type } from "class-transformer";
import { Example } from "./utils";
import { IsEmail, IsNumber, Length, Max, Min } from "class-validator";
import { EmailSchema } from "./base";
import { ProfileSchema } from "./profiles";

export class RegisterSchema {
    @Example('John Doe')
    @Expose()
    @Length(5, 500)
    name?: string;

    @Example('johndoe@example.com')
    @Expose()
    @IsEmail({}, {message: "Enter a valid email address"})
    email?: string;

    @Example('strongpassword')
    @Expose()
    @Length(8, 50)
    password?: string;
}

export class VerifyEmailSchema extends EmailSchema {
    @Example(123456)
    @Expose()
    @Min(100000)
    @Max(999999)
    @IsNumber()
    otp?: number;
}

export class SetNewPasswordSchema extends VerifyEmailSchema {
    @Example("newstrongpassword")
    @Expose()
    @Length(8, 50)
    password?: string;
}

export class LoginSchema {
    @Example('johndoe@example.com')
    @Expose()
    @IsEmail({}, {message: "Enter a valid email address"})
    email?: string;

    @Example("password")
    @Expose()
    @Length(8, 50)
    password?: string;
}

const TOKEN_EXAMPLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

export class TokensSchema {
    @Expose()
    @Type(() => ProfileSchema)
    user?: ProfileSchema;

    @Example(TOKEN_EXAMPLE)
    @Expose()
    access?: string;
    
    @Example(TOKEN_EXAMPLE)
    @Expose()
    refresh?: string;
}

export class RefreshTokenSchema {
    @Example(TOKEN_EXAMPLE)
    @Expose()
    refresh?: string;
}

export class TokenSchema {
    @Example(TOKEN_EXAMPLE)
    @Expose()
    token?: string;
}