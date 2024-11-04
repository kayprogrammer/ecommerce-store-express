import { model, Schema } from "mongoose";
import { IBase } from "./base";

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

export { Country, ICountry }