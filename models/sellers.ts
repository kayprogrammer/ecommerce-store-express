import mongoose, { model, Schema, Types } from "mongoose";
import { IBase } from "./base";
import { BUSINESS_TYPE_CHOICES, SELLER_STATUS_CHOICES } from "./choices";
import { ICountry } from "./profiles";
import { IUser } from "./accounts";
import slugify from "slugify";
import { generateRandomNumber } from "./utils";

// Define the interface for the Seller model
interface ISeller extends IBase {
    user: Types.ObjectId | IUser
    name: string; 
    slug: string;
    email: string;
    phone: string;
    image: string;
    businessType: BUSINESS_TYPE_CHOICES;
    businessRegistrationNumber: string;
    taxIdentificationNumber: string;
    businessDescription: string;

    // Address Info
    address: string;
    city: string;
    state: string;
    country_: Types.ObjectId | ICountry;
    country: string;
    zipcode: number;

    // Bank Information
    bankName: string;
    bankAccountNumber: string;
    bankRoutingNumber: string;
    accountHolderName: string;

    // Identity Verification
    governmentId: string;
    proofOfAddress: string;
    businessLicense: string;

    productCategories: Types.ObjectId[];

    status: SELLER_STATUS_CHOICES;

}
  
// Create the Seller schema
const SellerSchema = new Schema<ISeller>({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, maxlength: 500 },
    slug: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true, maxlength: 20 },
    image: { type: String },
    businessType: { type: String, enum: BUSINESS_TYPE_CHOICES, default: BUSINESS_TYPE_CHOICES.SOLE_PROPRIETORSHIP },
    businessRegistrationNumber: { type: String, required: true, maxlength: 100 },
    taxIdentificationNumber: { type: String, required: true, maxlength: 100 },
    businessDescription: { type: String, required: true, maxlength: 5000 },

    address: { type: String, required: true, maxlength: 200 },
    city: { type: String, required: true, maxlength: 50 },
    state: { type: String, required: true, maxlength: 50 },
    country_: { type: Schema.Types.ObjectId, ref: 'Country' },
    zipcode: { type: Number, required: true },

    bankName: { type: String, required: true, maxlength: 200 },
    bankAccountNumber: { type: String, required: true, maxlength: 20 },
    bankRoutingNumber: { type: String, required: true, maxlength: 50 },
    accountHolderName: { type: String, required: true, maxlength: 200 },

    governmentId: { type: String },
    proofOfAddress: { type: String },
    businessLicense: { type: String },

    productCategories: [{ type: Schema.Types.ObjectId, required: true }],

    status: { type: String, enum: SELLER_STATUS_CHOICES, default: SELLER_STATUS_CHOICES.PENDING },
}, { timestamps: true });
  
SellerSchema.virtual('country').get(function(this: ISeller) {
    const countryObj = this.country_ as ICountry
    return countryObj?.name || null;
});

SellerSchema.pre('save', async function (next) {
    try {
        if (this.isModified('name') || this.isNew) {
        // Generate base slug
        const baseSlug = slugify(this.name, { lower: true, strict: true });
        let slug = baseSlug

        // Check for uniqueness
        while (await mongoose.model('Seller').exists({ slug })) {
            slug = `${baseSlug}-${generateRandomNumber()}`;
        }
        this.slug = slug;
        }
        next();
    } catch (error: any) {
        next(error)
    }
});

// Create the Seller model
const Seller = model<ISeller>('Seller', SellerSchema);

export { Seller, ISeller }