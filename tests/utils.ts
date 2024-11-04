import { createAccessToken, createRefreshToken, createUser } from "../managers/users"
import { IUser, User } from "../models/accounts"
import { ACCOUNT_TYPE_CHOICES } from "../models/choices"

const BASE_URL = "/api/v1"


// USERS AND AUTH------------
const testUser = async (): Promise<IUser> => {
    const userData = { name: "Test User", email: "testuser@example.com", password: "testuserpass" }
    let user = await User.findOne({ email: userData.email })
    if (!user) user = await createUser(userData)
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

export { BASE_URL, testUser, testAdminUser, testTokens }