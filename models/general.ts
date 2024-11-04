import mongoose, { Schema, CallbackError, Model } from 'mongoose';
import { IBase } from './base';

interface ISiteDetail extends IBase {
    name: string;
    email: string;
    phone: string;
    address: string;
    fb: string;
    tw: string;
    wh: string;
    ig: string;
}

// Extend the Model interface to include the getOrCreate method
interface SiteDetailModel extends Model<ISiteDetail> {
    getOrCreate(query: Partial<ISiteDetail>): Promise<ISiteDetail>;
}

const siteDetailSchema = new Schema<ISiteDetail>({
    name: { type: String, default: "E-Store", maxlength: 300 },
    email: { type: String, default: "kayprogrammer1@gmail.com" },
    phone: { type: String, default: "+2348133831036", maxlength: 300 },
    address: { type: String, default: "234, Lagos, Nigeria", maxlength: 300 },
    fb: { type: String, default: "https://facebook.com", maxlength: 300 },
    tw: { type: String, default: "https://twitter.com", maxlength: 300 },
    wh: { type: String, default: "https://wa.me/2348133831036", maxlength: 300 },
    ig: { type: String, default: "https://instagram.com", maxlength: 300 },
}, {
    timestamps: true
});

// Pre-save hook to enforce a single instance of SiteDetail
siteDetailSchema.pre('save', async function (next: (err?: CallbackError) => void) {
    // Use a type assertion to tell TypeScript that 'this' is of type ISiteDetail
    const existing = await SiteDetail.findOne() as ISiteDetail | null;
    if (existing && existing._id.toString() !== (this._id as mongoose.Types.ObjectId).toString()) {
        return next(new Error('There can be only one Site Detail instance'));
    }
    next();
});

// Static method to get or create the singleton instance
siteDetailSchema.statics.getOrCreate = async function (data: Partial<ISiteDetail>) {
    let siteDetail = await this.findOne();
    if (!siteDetail) {
        siteDetail = await this.create(data);
    }
    return siteDetail;
};

const SiteDetail = mongoose.model<ISiteDetail, SiteDetailModel>('SiteDetail', siteDetailSchema);

export default SiteDetail;