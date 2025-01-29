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
import { ErrorCode } from '../config/handlers';

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
        name: 'Test User', email: 'test@example.com', phone: '+2341234560',
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

    it('Should accept address creation due to valid data', async () => {
        addressData.countryId = country.id;
        const res = await authRequestApp.post(`${baseUrl}/addresses`).send(addressData);
        expect(res.statusCode).toBe(200);
        const respBody = res.body;
        const { countryId, ...addressDataWithoutCountryId } = addressData;
        const expectedResponseData = { ...addressDataWithoutCountryId, id: expect.any(String), country: country.name }
        expect(respBody).toMatchObject({
          status: "success",
          message: "Address created successful",
          data: expectedResponseData
        });
    });

    it('Should reject address fetch due to invalid ID', async () => {
      const res = await authRequestApp.get(`${baseUrl}/addresses/${new Types.ObjectId()}`);
      expect(res.statusCode).toBe(404);
      const respBody = res.body;
      expect(respBody).toMatchObject({
        status: "failure",
        code: ErrorCode.NON_EXISTENT,
        message: "User has no shipping address with that ID",
      });
    });

    it('Should accept address fetch due to valid ID', async () => {
      const res = await authRequestApp.get(`${baseUrl}/addresses/${address.id}`);
      expect(res.statusCode).toBe(200);
      const respBody = res.body;
      expect(respBody).toMatchObject({
        status: "success",
        message: "Shipping Address Retrieved Successfully",
        data: convertSchemaData(ShippingAddressSchema, address)
      });
    });

    it('Should accept address update due to valid data', async () => {
      addressData.name = 'Test User Updated';
      const res = await authRequestApp.put(`${baseUrl}/addresses/${address.id}`).send(addressData);
      expect(res.statusCode).toBe(200);
      const respBody = res.body;
      address.name = addressData.name;
      expect(respBody).toMatchObject({
        status: "success",
        message: "Shipping Address Updated Successfully",
        data: convertSchemaData(ShippingAddressSchema, address)
      });
    });

    it('Should accept address delete due to valid data', async () => {
      const res = await authRequestApp.delete(`${baseUrl}/addresses/${address.id}`);
      expect(res.statusCode).toBe(200);
      const respBody = res.body;
      expect(respBody).toMatchObject({
        status: "success",
        message: "Shipping Address Deleted Successfully",
      });
    });
});