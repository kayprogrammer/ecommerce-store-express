import { Expose } from "class-transformer";
import { BUSINESS_TYPE_CHOICES } from "../models/choices";
import { Example } from "./utils";
import { ID_EXAMPLE } from "./base";
import { IsArray, IsEmail, IsEnum, IsMongoId, IsPhoneNumber, IsTaxId, Length, Max, Min } from "class-validator";


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
    @Example("+23412345678")
    @IsPhoneNumber()
    phone?: string;
    
    @Expose()
    @Example(BUSINESS_TYPE_CHOICES.SOLE_PROPRIETORSHIP)
    @IsEnum(BUSINESS_TYPE_CHOICES)
    businessType?: BUSINESS_TYPE_CHOICES;
    
    @Expose()
    @Example("TS28382")
    @Length(5, 100)
    businessRegistrationNumber?: string;
    
    @Expose()
    @Example("TX934920494")
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
    @Min(5)
    @Max(30)
    zipcode?: number;
    
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
    @Example("https://img.url")
    governmentId?: Buffer;
    
    @Expose()
    @Example("https://img.url")
    proofOfAddress?: Buffer;
    
    @Expose()
    @Example("https://img.url")
    businessLicense?: Buffer;
    
    @Expose()
    @Example(["clothing"])
    @IsArray()
    productCategorySlugs?: string[];
}