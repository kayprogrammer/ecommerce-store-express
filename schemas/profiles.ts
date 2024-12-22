import { Expose } from "class-transformer";
import { ACCOUNT_TYPE_CHOICES, AUTH_TYPE_CHOICES } from "../models/choices";
import { Example } from "./utils";
import { IsEmail, IsMongoId, IsNotEmpty, Length } from "class-validator";
import { ID_EXAMPLE, UserSchema } from "./base";
import { generateSwaggerExampleFromSchema } from "../docs/utils";

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

export class CountrySchema {
    @Expose()
    @Example(ID_EXAMPLE)
    id?: string;

    @Expose()
    @Example("Nigeria")
    name?: string;

    @Expose()
    @Example("NG")
    code?: string;
}

export class ShippingAddressBaseSchema {
    @Expose()
    @Example("John Doe")
    name?: string;

    @Expose()
    @Example("johndoe@example.com")
    email?: string;

    @Expose()
    @Example("+2341234560")
    phone?: string;

    @Expose()
    @Example("123, Street, Aboru")
    address?: string;

    @Expose()
    @Example("Life")
    city?: string;

    @Expose()
    @Example("Lagos")
    state?: string;

    @Expose()
    @Example("Nigeria")
    country?: string;

    @Expose()
    @Example(123456)
    zipcode?: number;   
}

export class ShippingAddressSchema extends ShippingAddressBaseSchema {
    @Expose()
    user?: UserSchema;

    @Expose()
    @Example(ID_EXAMPLE)
    id?: string;
}

export class ShippingAddressInputSchema {
    @Expose()
    @Example("John Doe")
    @IsNotEmpty()
    @Length(3, 500)
    name?: string;

    @Expose()
    @Example("johndoe@example.com")
    @IsEmail({}, {message: "Enter a valid email address"})
    email?: string;

    @Expose()
    @Example("+2341234560")
    @IsNotEmpty()
    phone?: string;

    @Expose()
    @Example("123, Street, Aboru")
    @IsNotEmpty()
    address?: string;

    @Expose()
    @Example("Life")
    @IsNotEmpty()
    city?: string;

    @Expose()
    @Example("Lagos")
    @IsNotEmpty()
    state?: string;

    @Expose()
    @Example(ID_EXAMPLE)
    @IsMongoId({message: "Enter a valid ID"})
    countryId?: string;

    @Expose()
    @Example(123456)
    @IsNotEmpty()
    zipcode?: number;   
}