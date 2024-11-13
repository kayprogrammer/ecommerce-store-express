import { model, Types } from "mongoose";
import { IBase } from "./base";
import { Schema } from "mongoose";
import { IUser } from "./accounts";

// Define the interface for the Country model
interface ICountry extends IBase {
    name: string;
    code: string;
}
// Create the Country schema
const CountrySchema = new Schema<ICountry>({
    name: { type: String, required: true },
    code: { type: String, required: true },
}, { timestamps: true })
  
// Create the Country model
const Country = model<ICountry>('Country', CountrySchema);

  
// Define the interface for the Shipping Address model
interface IShippingAddress extends IBase {
    user: Types.ObjectId | IUser
    name: string; 
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country_: Types.ObjectId | ICountry;
    country: string;
    zipcode: number;
}
  
// Create the Shipping Address schema
const ShippingAddressSchema = new Schema<IShippingAddress>({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, maxlength: 500 },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country_: { type: Schema.Types.ObjectId, ref: 'Country' },
    zipcode: { type: Number, required: true },
}, { timestamps: true });
  
ShippingAddressSchema.virtual('country').get(function(this: IShippingAddress) {
    const countryObj = this.country_ as ICountry
    return countryObj?.name || null;
});

// Create the ShippingAddress model
const ShippingAddress = model<IShippingAddress>('ShippingAddress', ShippingAddressSchema);

export { ShippingAddress, IShippingAddress, Country, ICountry }