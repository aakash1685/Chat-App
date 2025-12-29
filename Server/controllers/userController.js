import { generateUserToken } from "../lib/utils.js";
import userModel from "../models/userModel.js";
import cloudinary from "../lib/cloudinary.js";

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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    const userData = await userModel.findOne({ email });
    const isPassword = await bcrypt.compare(password, userData.password);
    if (!isPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials"
      });
    }
    const token = generateUserToken(userData._id);
    res.status(200).json({
      success: true,
      userData,
      token,
      message: "Login successfully"
    })
  } catch (error) {
    console.log("Error: ",error.message);
    res.json({
      success: false,
      message: error.message
    })
  }
};

//Controller to check if user is authenticate or not
export const checkAuth = (req,res) => {
  res.json({success: true, user: req.user});
}

//Controller to update user profile details
export const updateProfile = async (req,res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;
    let updatedUser;

    if(!profilePic){
      updatedUser = await userModel.findByIdAndUpdate(userId, {bio, fullName}, {new:true});
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await userModel.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new:true});
    }
    res.json({success: true, user: updatedUser});
  } catch (error) {
    console.log("Error: ", error.message);
    res.json({success: false, message: error.message});
  }
}