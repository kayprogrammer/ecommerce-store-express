import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import app from '../index';
import { IUser } from '../models/accounts';
import { BASE_URL, convertSchemaData } from './utils';
import TestAgent from 'supertest/lib/agent';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ICountry, IShippingAddress } from '../models/profiles';
import { CountrySchema, ProfileSchema, ShippingAddressSchema } from '../schemas/profiles';
import { testCountry, testShippingAddress, testTokens, testVerifiedUser } from './data';

describe("Testing Profiles Flow", () => { 
    let mongoServer: MongoMemoryServer;
    let baseUrl: string = `${BASE_URL}/profiles`
    let user: IUser
    let requestApp: TestAgent = request.agent(app)
    let authRequestApp: TestAgent
    let country: ICountry
    let address: IShippingAddress

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        user = await testVerifiedUser();
        const tokens = await testTokens(user)
        authRequestApp = requestApp.set('Authorization', `Bearer ${tokens.access}`)
        country = await testCountry()
        address = await testShippingAddress(user, country)
    });
    
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('Should return a user profile successfully', async () => {
        // Check for a successful return of the user profile
        const res = await authRequestApp.get(baseUrl);
        expect(res.statusCode).toBe(200);
        const respBody = res.body;
        expect(respBody).toMatchObject({
          status: "success",
          message: "Profile Retrieved Successfully",
          data: convertSchemaData(ProfileSchema, user)
        });
    });

    it('Should update a user profile successfully', async () => {
        // Check for a successful return of the user profile
        const name = 'Test User Updated';
        const res = await authRequestApp.post(baseUrl).field('name', name);
        expect(res.statusCode).toBe(200);
        const respBody = res.body;
        user.name = name;
        expect(respBody).toMatchObject({
          status: "success",
          message: "Profile updated successfully",
          data: convertSchemaData(ProfileSchema, user)
        });
    });

    it('Should return all countries', async () => {
        // Check for a successful return of all countries
        const res = await requestApp.get(`${baseUrl}/countries`);
        expect(res.statusCode).toBe(200);
        const respBody = res.body;
        expect(respBody).toMatchObject({
          status: "success",
          message: "Countries Retrieved Successfully",
          data: [convertSchemaData(CountrySchema, country)]
        });
    });

    it('Should return all user shipping addresses', async () => {
        const res = await authRequestApp.get(`${baseUrl}/addresses`);
        expect(res.statusCode).toBe(200);
        const respBody = res.body;
        expect(respBody).toMatchObject({
          status: "success",
          message: "Shipping Addresses Retrieved Successfully",
          data: [convertSchemaData(ShippingAddressSchema, address)]
        });
    });

    const addressData = {
        name: 'Test User', email: 'test@wxample.com', phone: '+2341234560',
        address: 'Test Address', city: 'Test City', state: 'Test State',
        countryId: new Types.ObjectId(), zipcode: 100001
    }
    it('Should reject address creation due to invalid country id', async () => {
        const res = await authRequestApp.post(`${baseUrl}/addresses`).send(addressData);
        expect(res.statusCode).toBe(422);
        const respBody = res.body;
        expect(respBody).toMatchObject({
          status: "failure",
          message: "Invalid Entry",
          data: { countryId: "No country with that ID" }
        });
    });
});