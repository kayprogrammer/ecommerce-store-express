import request from "supertest";
import app from "..";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { BASE_URL } from "./utils";

describe('GeneralRoute', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('Should return site details', async () => {
    const res = await request(app).get(`${BASE_URL}/general/site-detail`);
    expect(res.statusCode).toBe(200);
    const respBody = res.body;
    expect(respBody).toHaveProperty('status', 'success');
    expect(respBody).toHaveProperty('message', 'Site Details Fetched');
    
    const expectedKeys: string[] = ["name", "email", "phone", "address", "fb", "tw", "wh", "ig"];
    for (const key of expectedKeys) {
      expect(Object.keys(respBody.data)).toContain(key);
    }
  });
});