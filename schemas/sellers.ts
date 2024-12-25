import { Expose, Transform, Type } from "class-transformer";
import { BUSINESS_TYPE_CHOICES } from "../models/choices";
import { Example } from "./utils";
import { ID_EXAMPLE, PaginatedResponseSchema } from "./base";
import { IsArray, IsEmail, IsEnum, IsMongoId, IsNumberString, IsPhoneNumber, IsString, IsTaxId, Length } from "class-validator";
import { ProductDetailSchema, ProductListSchema } from "./shop";
import { generateSwaggerExampleFromSchema } from "../docs/utils";


export class SellerApplicationSchema {
    @Expose()
    @Example("John Stores")
    @Length(5, 500)
    name?: string;
    
    @Expose()
    @Example("johnstores@example.com")
    @IsEmail({}, { message: "Enter a valid email" })
    email?: string;
    
    @Expose()
    @Example("+2348112345069")
    @IsPhoneNumber()
    phone?: string;

    @Expose()
    image?: Buffer;
    
    @Expose()
    @Example(BUSINESS_TYPE_CHOICES.SOLE_PROPRIETORSHIP)
    @IsEnum(BUSINESS_TYPE_CHOICES)
    businessType?: BUSINESS_TYPE_CHOICES;
    
    @Expose()
    @Example("TS28382")
    @Length(5, 100)
    businessRegistrationNumber?: string;
    
    @Expose()
    @Example("12-3456789")
    @IsTaxId()
    taxIdentificationNumber?: string;
    
    @Expose()
    @Example("We sell clothings of all kinds")
    @Length(20, 5000)
    businessDescription?: string;
    
    @Expose()
    @Example("123, Good Street")
    @Length(5, 200)
    address?: string;
    
    @Expose()
    @Example("Lagos")
    @Length(5, 50)
    city?: string;
    
    @Expose()
    @Example("Lagos")
    @Length(5, 50)
    state?: string;
    
    @Expose()
    @Example(ID_EXAMPLE)
    @IsMongoId()
    countryId?: string;
    
    @Expose()
    @Example(123456)
    @Length(5, 30)
    @IsNumberString()
    zipcode?: string;
    
    @Expose()
    @Example("Good Bank")
    @Length(3, 200)
    bankName?: string;
    
    @Expose()
    @Example("128239239")
    @Length(5, 20)
    bankAccountNumber?: string;
    
    @Expose()
    @Example("2382843239")
    @Length(5, 50)
    bankRoutingNumber?: string;
    
    @Expose()
    @Example("John Doe")
    @Length(5, 200)
    accountHolderName?: string;
    
    @Expose()
    governmentId?: Buffer;
    
    @Expose()
    proofOfAddress?: Buffer;
    
    @Expose()
    businessLicense?: Buffer;
    
    @Expose()
    @Example(["clothing"])
    @Transform(({ value }) => value ? value.split(',') : [], { toClassOnly: true }) // Transform the string to an array
    @IsArray()
    @IsString({ each: true })
    productCategorySlugs?: string[];
}
