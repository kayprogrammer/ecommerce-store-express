import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';
import fs from 'fs';
import ENV from '../config/conf'
import { IUser } from '../models/accounts';
import { createOtp } from "../managers/users"

const transporter: Transporter = nodemailer.createTransport({
    host: ENV.EMAIL_HOST, 
    port: ENV.EMAIL_PORT, 
    secure: ENV.EMAIL_USE_SSL, 
    auth: {
        user: ENV.EMAIL_HOST_USER, 
        pass: ENV.EMAIL_HOST_PASSWORD,
    },
});

const readTemplate = (filePath: string, replacements: Record<string, string>): string => {
    const templatePath = path.resolve(__dirname, "..", 'templates', filePath);
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');

    for (const [key, value] of Object.entries(replacements)) {
        const placeholder = `{{${key}}}`;
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
    }

    return htmlContent;
};

const getEmailDetails = async (type: "activate" | "reset" | "reset-success" | "welcome" | "payment-success" | "payment-failed", user: IUser, paymentData: Record<string,any> | null): Promise<{ templatePath: string; subject: string; context: Record<string, string> }> => {
    let templatePath = 'welcome.html';
    let subject = 'Welcome!';
    let context: Record<string,any> = { name: user?.name };
    let paymentType = ""
    switch (type) {
        case 'activate':
            templatePath = 'email-activation.html';
            subject = 'Activate your account';
            // Simulate OTP generation
            let otp = await createOtp(user);
            context.otp = otp; // Replace with actual OTP logic
            break;
        case 'reset':
            templatePath = 'password-reset.html';
            subject = 'Reset your password';
            // Simulate OTP generation
            otp = await createOtp(user);
            context.otp = otp; // Replace with actual OTP logic
            break;
        case 'reset-success':
            templatePath = 'password-reset-success.html';
            subject = 'Password reset successfully';
            break;
        case 'payment-success':
            paymentType = paymentData?.type
            templatePath = 'payment-success.html';
            subject = `Payment ${paymentType}`;
            context.message = `Your payment of ₦${paymentData?.amount} was ${paymentType}`;
            context.paymentName = paymentData?.name;
            break;
        case 'payment-failed':
            paymentType = paymentData?.type
            const message = paymentType === "invalid" ? `Your payment of ₦${paymentData?.amount} was invalid` : `Your payment of ₦${paymentData?.amount} failed`;
            templatePath = 'payment-failed.html';
            subject = `Payment ${paymentType}`;
            context.message = message;
            context.paymentName = paymentData?.name;
            break;
        default:
            break;
    }

    return { templatePath, subject, context };
};

/**
 * Sends an email based on the provided type and user data.
 * @param {string} type - Type of the email to send. Can be 'activate', 'reset', etc.
 * @param {User} user - User object containing email and other user details.
 * @returns {Promise<void>} - A promise that resolves when the email is sent.
 * @throws {Error} - Throws an error if sending the email fails.
 */
const sendEmail = async (type: "activate" | "reset" | "reset-success" | "welcome" | "payment-success" | "payment-failed", user: any, paymentData: Record<string,any> | null = null): Promise<void> => {
    if (ENV.NODE_ENV === "test") return
    const { templatePath, subject, context } = await getEmailDetails(type, user, paymentData);
    const htmlContent = readTemplate(templatePath, context);

    const mailOptions = {
        from: ENV.DEFAULT_FROM_EMAIL,
        to: user?.email || paymentData?.email || ENV.DEFAULT_FROM_EMAIL,
        subject,
        html: htmlContent,
    };

    // Send email in background. Using a tool like bull queue will be better for intensive cases
    process.nextTick(async() => {
        await transporter.sendMail(mailOptions)
        .catch(error => {
            console.error('Error sending email:', error.message);
        });
    })
};

export { sendEmail }