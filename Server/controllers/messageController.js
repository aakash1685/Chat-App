import cloudinary from "../lib/cloudinary.js";
import messageModel from "../models/messageModel.js";
import userModel from "../models/userModel.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await userModel
      .find({ _id: { $ne: userId } })
      .select("-password"); //This will find the all the users expect logged in user

    //Count number of messages not seen
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await messageModel.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      }); //Find the all messages from the DB
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//Get All messages for Selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUser } = req.params;
    const myId = req.user._id;

    //Get all the messages from sender as well as our own
    const messages = await messageModel.find({
      $or: [
        { senderId: myId, receiverId: selectedUser },
        { senderId: selectedUser, receiverId: myId },
      ],
    });

    await messageModel.updateMany(
      { senderId: selectedUser, receiverId: myId },
      { seen: true }
    );
    res.json({ success: true, messages });
  } catch (error) {
    console.log("Error: ", error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await messageModel.findByIdAdnUpdate(id, { seen: true });
    res.json({
      success: true,
    });
  } catch (error) {
    console.log("Error: ", error.message);
    res.json({ success: false, message: error.message });
  }
};

//Send message to selcted user
export const sendMessage = async(req,res) => {
  try {
    const {text,image} = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;
    
    let imageUrl;
    if(image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await messageModel.create({
      senderId,
      receiverId,
      text,
      image: imageUrl
    });

    res.json({
      success: true,
      newMessage
    });
  

  } catch (error) {
    console.log("Error: ", error.message);
    res.json({
      success: false, message: error.message
    })
  }
}