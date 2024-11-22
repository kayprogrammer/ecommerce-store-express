import crypto from 'crypto';

// Helper function to generate a random alphanumeric string
const randomStringGenerator = (length: number):string => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}

const generateRandomNumber = () => Math.floor(1000000000 + Math.random() * 9000000000);

export { randomStringGenerator, generateRandomNumber }