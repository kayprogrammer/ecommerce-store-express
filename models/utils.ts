import crypto from 'crypto';

// Helper function to generate a random alphanumeric string
const randomStringGenerator = (length: number):string => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}

export { randomStringGenerator }