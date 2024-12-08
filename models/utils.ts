import crypto from 'crypto';
import mongoose from 'mongoose';
import { IReview } from './shop';

// Helper function to generate a random alphanumeric string
const randomStringGenerator = (length: number):string => crypto.randomBytes(length).toString('hex').slice(0, length);
const generateRandomNumber = () => Math.floor(1000000000 + Math.random() * 9000000000);
const generateRandomCode = (length = 10) => Array.from({ length }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');

const generateUniqueCode = async (modelClass: string, field: string, length: number): Promise<string> => {
    let code = generateRandomCode(length)
    // Check for uniqueness
    while (await mongoose.model(modelClass).exists({ [field]: code })) {
        code = generateRandomCode(50);
    }
    return code
} 

const getAvgRating = (reviews: IReview[]): number => {
    return reviews.reduce((sum, item) => sum + (item["rating"] || 0), 0) / reviews.length || 0;
}

export { randomStringGenerator, generateRandomNumber, generateRandomCode, generateUniqueCode, getAvgRating }