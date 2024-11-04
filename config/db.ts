import mongoose from 'mongoose';
import ENV from './conf';

const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};

export default connectDB;
