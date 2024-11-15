import { model, Schema, Types } from "mongoose";
import { IBase } from "./base";
import { BUSINESS_TYPE_CHOICES } from "./choices";
import { ICountry } from "./profiles";
import { IUser } from "./accounts";

// Define the interface for the Seller model
interface ISeller extends IBase {
    user: Types.ObjectId | IUser
    name: string; 
    slug: string;
    email: string;
    phone: string;
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

    isApproved: boolean;

}
  
// Create the Seller schema
const SellerSchema = new Schema<ISeller>({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, maxlength: 500 },
    slug: { type: String, maxlength: 1000 },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    businessType: { type: String, enum: BUSINESS_TYPE_CHOICES, default: BUSINESS_TYPE_CHOICES.SOLE_PROPRIETORSHIP },
    businessRegistrationNumber: { type: String, required: true },
    taxIdentificationNumber: { type: String, required: true },
    businessDescription: { type: String, required: true, maxlength: 500 },

    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country_: { type: Schema.Types.ObjectId, ref: 'Country' },
    zipcode: { type: Number, required: true },

    bankName: { type: String, required: true },
    bankAccountNumber: { type: String, required: true },
    bankRoutingNumber: { type: String, required: true },
    accountHolderName: { type: String, required: true },

    governmentId: { type: String, required: true },
    proofOfAddress: { type: String, required: true },
    businessLicense: { type: String, required: true },

    productCategories: [{ type: Schema.Types.ObjectId, required: true }],

    isApproved: { type: Boolean, default: false },
}, { timestamps: true });
  
SellerSchema.virtual('country').get(function(this: ISeller) {
    const countryObj = this.country_ as ICountry
    return countryObj?.name || null;
});

// Create the Seller model
const Seller = model<ISeller>('Seller', SellerSchema);

export { Seller, ISeller }