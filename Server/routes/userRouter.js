import express from "express"
const userRouter = express.Router();
import { checkAuth, login, signUp, updateProfile } from "../controllers/userController.js";
import {protectedRoute} from "../middlewares/auth.js";

userRouter.post("/signup", signUp);
userRouter.post("/login",login);
userRouter.put("/update-profile", protectedRoute, updateProfile);
userRouter.get("/check", protectedRoute, checkAuth);

export default userRouter;