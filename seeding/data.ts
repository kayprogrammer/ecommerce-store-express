import mongoose from "mongoose"
import ENV from "../config/conf"
import { createUser } from "../managers/users"
import { User } from "../models/accounts"
import SiteDetail from "../models/general"
import connectDB from "../config/db"
import { Country } from 'country-state-city';
import { Country as CountryModel } from "../models/shop"

const createSuperuser = async () => {
    let userDoc = { email: ENV.FIRST_SUPERUSER_EMAIL, password: ENV.FIRST_SUPERUSER_PASSWORD, name: "Test Admin" }
    const existingUser = await User.findOne({ email: userDoc.email })
    if (!existingUser) await createUser(userDoc, true)
}

const createReviewer = async () => {
    let userDoc = { email: ENV.FIRST_REVIEWER_EMAIL, password: ENV.FIRST_REVIEWER_PASSWORD, name: "Test Reviewer" }
    const existingUser = await User.findOne({ email: userDoc.email })
    if (!existingUser) await createUser(userDoc, true)
}

const createCountries = async () => {
    if (!(await CountryModel.exists({}))) {
        const countries = Country.getAllCountries();
        const countryDocs = countries.map(c => ({
            name: c.name,
            code: c.isoCode,
        }));
        await CountryModel.insertMany(countryDocs);
    } 
}

const createData = async () => {
    console.log("GENERATING INITIAL DATA....")
    await connectDB()
    await createSuperuser()
    await createReviewer()
    await SiteDetail.getOrCreate({})
    await createCountries()
    mongoose.disconnect()
    console.log("INITIAL DATA GENERATED....")
}

createData()