import { generateUserToken } from "../lib/utils.js";
import userModel from "../models/userModel.js";

export const signUp = async (req, res) => {
  const { fullName, email, password, bio } = req.body;
  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }
    const user = await userModel.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "Account already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userModel.create({
      fullName,
      email,
      password,
      password: hashedPassword,
      bio,
    });

    const token = generateUserToken(newUser._id);
    res.json({
      success: true,
      userData: newUser,
      token,
      message: "Account Create Successfully",
    });
  } catch (error) {
    console.log("Error: ", error);
    res.send({
      success: false,
      message: error.message,
    });
  }
};
