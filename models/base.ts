import { Document, Types } from 'mongoose';

// Define the base interface
interface IBase extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export { IBase };
