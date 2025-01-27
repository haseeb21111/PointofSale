import express from "express";
import { loginController } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/login", loginController);


export default userRouter;