import express from "express";
import { createUserAccount,authenticateUser,signOutUser,getCurrentUserProfile,updateUserProfile } from "../controllers/user.controller";
import {upload} from "..utils/multer.js"
import {isAuthenticated} from "../middleware/auth.middleware.js"
import { validateSignUp } from "../middleware/validation.middleware.js";

const router = express.Router();


//auth route
router.post("/signup",validateSignUp, createUserAccount);
router.post("/signin", authenticateUser);
router.post("/signout", signOutUser);


//profile route (add the auth middleware)
router.get("/profile", isAuthenticated, getCurrentUserProfile);
router.patch("/profile",
      isAuthenticated,
     upload.single("avatar"),
      updateUserProfile
    );

export default router; 