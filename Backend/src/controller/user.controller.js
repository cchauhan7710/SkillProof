import {asyncHandler} from "../utils/asyncHandler.js"
// import {apiError} from "../utils/apiError.js"
import { apiError } from "../utils/apiError.js";
import {User} from "../models/User.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)

    if (!user) {
      throw new apiError(404, "User not found")
    }
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }

  } catch (error) {
    console.log("REAL ERROR:", error)
    throw new apiError(401, error.message || "Error while creating tokens")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  
  //steps to register user
  //step1 : get the user detail from the frontend or req.body

   const {fullname,username,email,password} = req.body
  //  console.log("email:",email)

   
  //step2 : check no empy fields

  if([fullname,username,email,password].some((field)=>field?.trim()==="")
  ){

    throw new apiError(400,"All fields are required")
}
  //step4 : check is user already exist 
  const existeduser = await User.findOne({
    $or: [
      {username},
      {email}
    ]
  })
  if(existeduser)
  {
    throw new apiError(409,"User Already existed with email or username ")
  }

  //step5 : check the avatar
 const avatarLocalPath =  req.files?.avatar[0]?.path;
 if (!avatarLocalPath) {
  throw new apiError(400,"Avatar file is required")
 }

  //step6 : upload avatar on cloudinary

 const avatar = await uploadOnCloudinary(avatarLocalPath)

 if (!avatar) {
  throw new apiError(400,"Avatar not found or error while uploading avatar on cloudinary")
 }

 //step7 : create user in the database & check user creation

 const user = await User.create({
    fullname,
    avatar:avatar.url,
    email,
    password,
    username : username.toLowerCase()
  })

   //step8 :  remove the password and refeshToken from res 
 const createdUser =  await User.findById(user._id).select(
  "-password -refreshToken"
 )

   if (!createdUser) {
  throw new apiError(500,"Something Went Wrong while creating the User")
 }
   //step9 : return res 
 return res.status(200).json(
  new ApiResponse(200,createdUser,"User Registered SuccessFully")
 )
 
})

//User Login

const loginUser = asyncHandler(async(req,res)=>{
//step 1: Get User detail from user eg. username , password from req.body
  const {email,username,password} = req.body;
  // console.log("email:",email)
  

//step 2: check for empty fields as all fields are required
if (!( username || email )) {
   throw new apiError(400,"Username and email is required")
}

//step 3: find user 

const user = await User.findOne({
  $or:[
    {email},
    {username}
  ]
})
 if(!user)
 {
  throw  new apiError(404,"User Not Found. Please Register First")
 }
 
//step 4: check the password of user 
const isPasswordValid = await  user.isPasswordCorrect(password)

if (!isPasswordValid) {
  throw new apiError(401,"Invalid password")
}
//step 5: access and refresh Token

const { accessToken , refreshToken } =  await generateAccessAndRefreshToken(user._id)
//step 6: send cookies

const loggedInUsser = await User.findById(user._id).select("-password -refreshToken")//optional 

//cookies send 
const option  = {
  httpOnly:true,
  secure:true
}


//step 7: return res 

return res.
status(200)
.cookie("accessToken",accessToken,option)
.cookie("refreshToken",refreshToken,option)

.json(
  new ApiResponse(200,
    {
      user: loggedInUsser ,accessToken,refreshToken
    },
    "User Logged In Successfully "
)
)
})

//logout
const logoutUser = asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(
  req.user._id,
  {
    $set: {
      refreshToken: undefined
    }
  },
  {
    new: true
  }
)

  const option  = {
    httpOnly:true,
    secure:true 
  }
  return res
  .status(200)
  .clearCookie("accessToken", option )
  .clearCookie("refreshToken" , option )
  .json(new ApiResponse(200,{},"User Logged Out"))
})

//refresh the Acces Token 
 const refreshAccessToken = asyncHandler(async(req,res)=>
{

 const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

 if (!incomingRefreshToken) {
  throw new apiError(401,"Unauthorized request access")
 }

 try {
   const decodedToken  =  jwt.verify(
   incomingRefreshToken,
   process.env.REFRESH_TOKEN_SECRET
  )
  
  const user = await User.findById(decodedToken?._id)
 
  if (!user) {
   throw new apiError(401,"Invalid RefreshToken")
  }
 
 
  if (incomingRefreshToken !== user?.refreshToken) {
 
   throw new apiError(401,"refresh token is expired and used")
   
  }
 
  const option = {
   httpOnly:true,
   secure:true
  }
 
 const {accessToken,newRefreshToken} =  await generateAccessAndRefreshToken(user._id);
  return res.status(200)
  .cookie("AccessToken",accessToken,option)
  .cookie("RefreshToken",newRefreshToken,option )
 .json(
   new ApiResponse(
 200,
 {accessToken,refreshToken:newRefreshToken},
 "Access Token refreshed "
   )
 )
 } catch (error) {
  throw new apiError(401,
    error?.message||
    "Invalid Refresh Token or Error while refreshing AccessToken ")
  
 }
})

//Change Password
const updatePassword = asyncHandler(async(req,res)=>
{
  //step 1:  get the data of user from req.body
  const {oldPassword, newPassword}=req.body;

  // step 2 : Check the  fields -no empty 
  if(!oldPassword||!newPassword)
  {
    throw new apiError(401,"Old and New Password is required")
  }

  //step 3 : macth the old password with db 

 const user  = await User.findById(req.user?._id)
 

 if (!user) {

  throw new apiError(400," User not found")
  
 }

 const isOldPasswordValid = await user.isPasswordCorrect(oldPassword)

 if (!isOldPasswordValid) {
  throw new apiError(400,"Invalid old password")
 }

//step 4 : overwrite the newpassword with old password

  user.password = newPassword;


  //step 5 : logout from all devices
   user.refreshToken = undefined
  //step 6 : save the password

 await  user.save({ validateBeforeSave: false});
  //atep 7 : return res
  return res.status(200)
  .json(
    new ApiResponse(
      200,
      {},
      "Password Changed Successfully. Please Login Again"
    )
  )

}) 

// get current User
const getCurrentUser = asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
    req.user,
    "Current User Fetched Successfully"
    )
  )
})

//update username and email
const updateAccountDetails = asyncHandler(async(req,res)=>{


  const {fullname , email} = req.body;

  if ( !fullname || !email ) {
    throw new apiError(400,"Fullname and email is required")

    
  }
  const user  = await User.findByIdAndUpdate(
    req.user?._id,

    {
      $set:{
        fullname,
        email

    }
  },

    {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "Account details updated SuccessFully"
    )
  )

})

//update Avatar
const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    throw new apiError(400, "Error while uploading the avatar to Cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new apiError(404, "User not found or update failed");
  }

  return res.status(200).json(
    new ApiResponse(200, user, "Avatar updated successfully")
  );
});

export  {
  registerUser,
  loginUser,
  logoutUser,
  updatePassword,
  refreshAccessToken,
  updateAccountDetails,
  getCurrentUser,
  updateAvatar
}