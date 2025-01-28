import { createAccessToken, createRefreshToken, createUser } from "../managers/users"
import { IUser, User } from "../models/accounts"
import { ACCOUNT_TYPE_CHOICES } from "../models/choices"
import { Country, ICountry, IShippingAddress, ShippingAddress } from "../models/profiles"

// USERS AND AUTH------------
const testUser = async (): Promise<IUser> => {
    const userData = { name: "Test User", email: "testuser@example.com", password: "testuserpass" }
    let user = await User.findOne({ email: userData.email })
    if (!user) user = await createUser(userData)
    return user
}

const testVerifiedUser = async (): Promise<IUser> => {
    let userData = { name: "Test UserVerified", email: "testuserverified@example.com", password: "testuserverified" }
    let user = await User.findOne({ email: userData.email })
    if (!user) user = await createUser(userData, true)
    return user
}

const testAdminUser = async (): Promise<IUser> => {
    const userData = { name: "Test AdminUser", email: "testadminuser@example.com", password: "testadminuserpass", accountType: ACCOUNT_TYPE_CHOICES.SUPERUSER }
    let user = await User.findOne({ email: userData.email })
    if (!user) user = await createUser(userData)
    return user
}

const testTokens = async (user: IUser): Promise<{access: string, refresh: string}> => {
    const access = createAccessToken(user.id) 
    const refresh = createRefreshToken() 
    const tokens = { access, refresh }
    await User.updateOne(
        { _id: user._id },
        { $set: { "tokens": tokens } }
    )
    return tokens
}

// PROFILES------------

const testCountry = async (): Promise<ICountry> => {
    const countryData = { name: "Test Country", code: "TC" }
    let country = await Country.findOne(countryData)
    if (!country) country = await Country.create(countryData)
    return country
}

const testShippingAddress = async (user: IUser, country: ICountry): Promise<IShippingAddress> => {
    const shippingData = { 
        user: user._id, name: "Test User", email: "test@example.com", phone: "+2341234560", 
        address: "Test Address", city: "Test City", state: "Test State", 
        country_: country._id, zipcode: 100001
    }
    let shippingAddress = await ShippingAddress.findOne(shippingData)
    if (!shippingAddress) shippingAddress = await ShippingAddress.create(shippingData)
    shippingAddress.country_ = country
    return shippingAddress
}

export {
    testUser, testVerifiedUser, testAdminUser, testTokens, testCountry, testShippingAddress
}