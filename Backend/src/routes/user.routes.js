import { Router } from "express";
import {
    logoutUser,
    loginUser,
    registerUser,
    updatePassword,
    updateAccountDetails,
    updateAvatar,
    getCurrentUser
} from "../controller/user.controller.js";
import { uploadeResume } from "../controller/resume.controller.js";

import { refreshAccessToken } from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1

        },

    ]),
    registerUser,

);


router.route("/login").post(loginUser)
router.route("/upload-Resume").post(
    verifyJWT,
    upload.single("resume"),
    uploadeResume
)



//secure Route
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/update-password").put(verifyJWT, updatePassword)
router.route("/update-account-details").put(verifyJWT, updateAccountDetails)
router.route("/update-avatar").put(verifyJWT, upload.single("avatar"), updateAvatar)
router.route("/current-user").get(verifyJWT, getCurrentUser)




export default router;