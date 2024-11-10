import { Expose } from "class-transformer";
import { ACCOUNT_TYPE_CHOICES, AUTH_TYPE_CHOICES } from "../models/choices";
import { Example } from "./utils";
import { IsNotEmpty, Length } from "class-validator";

export class ProfileSchema {
    @Example("John Doe")
    @Expose()
    name?: string;

    @Example("johndoe@example.com")
    @Expose()
    email?: string;

    @Example("https://johndoe-avatar.com")
    @Expose()
    avatar?: string;

    @Example(true)
    @Expose()
    isEmailVerified?: string;

    @Example(AUTH_TYPE_CHOICES.GENERAL)
    @Expose()
    authType?: string;

    @Example(ACCOUNT_TYPE_CHOICES.BUYER)
    @Expose()
    accountType?: string;
}

export class ProfileEditSchema {
    @Example("John Doe")
    @Expose()
    @Length(3, 500)
    @IsNotEmpty()
    name?: string;

    @Example("profile.jpg")
    @Expose()
    avatar?: Buffer;
}