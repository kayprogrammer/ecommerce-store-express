import { Expose, Transform, Type } from "class-transformer";
import { BUSINESS_TYPE_CHOICES, COLOR_CHOICES, SIZE_CHOICES } from "../models/choices";
import { Example, transformToNumber } from "./utils";
import { ID_EXAMPLE } from "./base";
import { IsArray, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsPhoneNumber, IsString, IsTaxId, Length, Max, Min } from "class-validator";
import { OrdersResponseSchema, ProductsResponseSchema } from "./shop";


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

export class ProductCreateSchema {
    @Expose()
    @Example("Big Shoe")
    @Length(3, 300)
    name?: string;
    
    @Expose()
    @Example("This is a really big shoe you should consider getting")
    @Length(30, 5000)
    desc?: string;
    
    @Expose()
    @Example(1000)
    @IsNumber()
    @Min(1)
    @Max(100000000000)
    @Transform(transformToNumber)
    priceOld?: number;
    
    @Expose()
    @Example(950)
    @IsNumber()
    @Min(1)
    @Max(100000000000)
    @Transform(transformToNumber)
    priceCurrent?: number;
    
    @Expose()
    @Example("category")
    @IsNotEmpty()
    categorySlug?: string;
    
    @Expose()
    @Example(10)
    @IsNumber()
    @Transform(transformToNumber)
    @Min(0)
    @Max(1000000)
    @IsOptional()
    stock?: number;
    
    @Expose()
    image1?: Buffer;
    
    @Expose()
    image2?: Buffer;
    
    @Expose()
    image3?: Buffer;
}

export class ProductEditSchema {
    @Expose()
    @Example("Big Shoe")
    @Length(3, 300)
    @IsOptional()
    name?: string;
    
    @Expose()
    @Example("This is a really big shoe you should consider getting")
    @Length(30, 5000)
    @IsOptional()
    desc?: string;
    
    @Expose()
    @Example(1000)
    @IsOptional()
    @Min(1)
    @Max(100000000000)
    @IsNumber()
    @Transform(transformToNumber)
    priceOld?: number;
    
    @Expose()
    @Example(950)
    @IsOptional()
    @Min(1)
    @Max(100000000000)
    @IsNumber()
    @Transform(transformToNumber)
    priceCurrent?: number;
    
    @Expose()
    @Example("category")
    @IsOptional()
    categorySlug?: string;
    
    @Expose()
    @Example(10)
    @IsNumber()
    @Transform(transformToNumber)
    @Min(0)
    @Max(1000000)
    @IsOptional()
    stock?: number;

    @Expose()
    image1?: Buffer;
    
    @Expose()
    image2?: Buffer;
    
    @Expose()
    image3?: Buffer;
}

export class VariantCreateSchema {
    @Expose()
    @Example(SIZE_CHOICES.M)
    @IsEnum(SIZE_CHOICES)
    @IsOptional()
    size?: SIZE_CHOICES;
    
    @Expose()
    @Example(COLOR_CHOICES.WHITE)
    @IsEnum(COLOR_CHOICES)
    @IsOptional()
    color?: COLOR_CHOICES;

    @Expose()
    @Example("Ideal for medium-sized machinery, dimensions: 100x100x100cm")
    @Length(10, 1000)
    desc?: string;
    
    @Expose()
    @Example(15)
    @IsNumber()
    @Transform(transformToNumber)
    @Min(0)
    @Max(1000000)
    stock?: number;
    
    @Expose()
    image?: Buffer;

    @Expose()
    @Example(20000)
    @Min(1)
    @Max(100000000000)
    @IsNumber()
    @Transform(transformToNumber)
    price?: number;
}

export class VariantEditSchema {
    @Expose()
    @Example(SIZE_CHOICES.M)
    @IsEnum(SIZE_CHOICES)
    @IsOptional()
    size?: SIZE_CHOICES;
    
    @Expose()
    @Example(COLOR_CHOICES.WHITE)
    @IsEnum(COLOR_CHOICES)
    @IsOptional()
    color?: COLOR_CHOICES;
    
    @Expose()
    @Example("This is a really big shoe you should consider getting")
    @Length(10, 1000)
    @IsOptional()
    desc?: string;

    @Expose()
    @Example(15)
    @IsNumber()
    @Transform(transformToNumber)
    @Min(0)
    @Max(1000000)
    stock?: number;
    
    @Expose()
    image?: Buffer;

    @Expose()
    @Example(20000)
    @Min(1)
    @Max(100000000000)
    @IsNumber()
    @Transform(transformToNumber)
    @IsOptional()
    price?: number;
}

export class SellerDashboardSchema {
    @Expose()
    @Example("John Doe")
    name?: string;
    
    @Expose()
    @Example("https://alala.com")
    image?: string;
    
    @Expose()
    @Type(() => ProductsResponseSchema)
    productsData?: ProductsResponseSchema;
    
    @Expose()
    @Type(() => OrdersResponseSchema)
    ordersData?: OrdersResponseSchema;
}