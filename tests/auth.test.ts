import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import { IUser, User } from '../models/accounts';
import { createOtp, createUser } from '../managers/users';
import { BASE_URL, testTokens, testUser } from './utils';
import TestAgent from 'supertest/lib/agent';
import { ErrorCode } from '../config/handlers';
import * as userManager from '../managers/users';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe("Testing User Authentication Flow", () => { 
    let mongoServer: MongoMemoryServer;
    let baseUrl: string = `${BASE_URL}/auth`
    let user: IUser
    let requestApp: TestAgent = request.agent(app)

    const regData = {
        email: "testuser123456@test.com",
        name: "Test User",
        password: "password"
    }
    
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        user = await testUser()
    });
    
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it("should register a new user into the application", async () => {
        const response = await requestApp.post(`${baseUrl}/register`).send(regData);
        expect(response.statusCode).toBe(201);
        expect(response.body.data.email).toBe("testuser123456@test.com");
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe("Registration successful");
    });

    it("should test request validation logic", async () => {
        regData.email = ""
        const response = await requestApp.post(`${baseUrl}/register`).send(regData);
        expect(response.statusCode).toBe(422);
        expect(response.body.message).toBe("Invalid Entry")
        expect(response.body.status).toBe('failure');
    });

    it("should allow user to verify their email address", async () => {
        const otp = await createOtp(user)
        const response = await requestApp.post(`${baseUrl}/verify-email`).send({
            email: user.email,
            otp
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("success");
    })

    it("should not verify users with invalid otp", async () => {
        await User.updateOne({ _id: user._id }, { isEmailVerified: false })
        const response = await requestApp.post(`${baseUrl}/verify-email`).send({
            email: user.email,
            otp: 123456
        })
        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe("failure");
    })

    it("should not resend otp to invalid email", async () => {
        const response = await requestApp.post(`${baseUrl}/resend-verification-email`).send({
            email: "invalidemail@gmail.com"
        });

        expect(response.body.status).toBe("failure");
        expect(response.statusCode).toBe(404);
    })

    it("should resend verification email to valid users", async () => {
        const response = await requestApp.post(`${baseUrl}/resend-verification-email`).send({
            email: user.email
        });
        expect(response.body.status).toBe("success");
        expect(response.statusCode).toBe(200);
    })

    it("should send password reset otp", async () => {
        const response = await requestApp.post(`${baseUrl}/send-password-reset-otp`).send({
            email: user.email
        });
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
    })

    it("should not send otp to invalid users", async () => {
        const response = await requestApp.post(`${baseUrl}/send-password-reset-otp`).send({
            email: "invaliduser@gmail.com"
        });

        expect(response.statusCode).toBe(404);
        expect(response.body.status).toBe("failure");
    })

    it("should validate new request password request", async () => {
        const response = await requestApp.post(`${baseUrl}/set-new-password`).send({
            email: user.email,
            password: "newpassword"
        });
        expect(response.statusCode).toBe(422);
        expect(response.body.status).toBe("failure");
    })

    it("should validate otp before setting of new password", async () => {
        const response = await requestApp.post(`${baseUrl}/set-new-password`).send({
            email: user.email,
            password: "newpassword",
            otp: 293821
        });

        expect(response.body.status).toBe("failure");
        expect(response.statusCode).toBe(400);
    });

    it("should set new password for users", async () => {
        const otp = await createOtp(user)
        const response = await requestApp.post(`${baseUrl}/set-new-password`).send({
            email: user.email,
            password: "newpassword",
            otp
        });

        expect(response.body.status).toBe("success");
        expect(response.statusCode).toBe(200);
    })

    it("should login existing users", async () => {
        const newUser = {
            email: "newuser@test.com",
            name: "New User",
            password: "password",
        }

        await createUser(newUser, true);
        const response = await requestApp.post(`${baseUrl}/login`).send({
            email: newUser.email,
            password: "password"
        });
        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({
            status: "success",
            message: "Login successfully",
            data: { 
                user: expect.any(Object),
                access: expect.any(String), 
                refresh: expect.any(String),
            }
        });
    });

    it("should not login non-existing users", async () => {
        const response = await requestApp.post(`${baseUrl}/login`).send({
            email: "nonexist@gmail.com",
            password: "password"
        });

        expect(response.body.status).toBe("failure");
        expect(response.statusCode).toBe(400);
    });

    it("should validate users password", async () => {
        const response = await requestApp.post(`${baseUrl}/login`).send({
            email: user.email,
            password: "incorrectpassword"
        });

        expect(response.body.status).toBe("failure");
        expect(response.statusCode).toBe(400);
    });

    it("should login existing users via google", async () => {
        // Mock google auth
        const validateGoogleTokenMock = jest
            .spyOn(userManager, 'validateGoogleToken')
            .mockResolvedValue({
                payload: {
                    name: 'Mocked Google User',
                    email: 'mocked@example.com',
                    picture: "https://mocked-avatar.com"
                },
                error: null
            });

        const response = await requestApp.post(`${baseUrl}/google`).send({ token: "token" });
        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({
            status: "success",
            message: "Login successful",
            data: { 
                user: expect.any(Object),
                access: expect.any(String), 
                refresh: expect.any(String),
            }
        });
        // Restore the original function after test
        validateGoogleTokenMock.mockRestore();
    });

    it("should validate google token", async () => {
        const response = await requestApp.post(`${baseUrl}/google`).send({ token: "token" });
        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            status: "failure",
            message: "Invalid Auth Token",
            code: ErrorCode.INVALID_TOKEN
        });
    });

    it("should refresh user tokens", async () => {
        const tokens = await testTokens(user)
        const response = await requestApp.post(`${baseUrl}/refresh`).send({
            refresh: tokens.refresh,
            password: "password"
        });

        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({
            status: "success",
            message: "Tokens refreshed successfully",
            data: { 
                user: expect.any(Object),
                access: expect.any(String), 
                refresh: expect.any(String),
            }
        });
    });

    it("should validate refresh token", async () => {
        const response = await requestApp.post(`${baseUrl}/refresh`).send({
            refresh: "invalidtoken"
        });

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            "status": "failure",
            "message": "Refresh token is invalid or expired!",
            "code": ErrorCode.INVALID_TOKEN
        })
    });

    it("should log user out successfully", async () => {
        const tokens = await testTokens(user)
        const response = await requestApp
            .get(`${baseUrl}/logout`)
            .set("Authorization", `Bearer ${tokens.access}`)
            .send();
        
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("success");
    });
});