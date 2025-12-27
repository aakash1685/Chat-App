import jwt from "jsonwebtoken"

//Generate User Token
export const generateUserToken = (userId) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET);
    return token;
}