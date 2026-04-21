import { apiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadeResume = asyncHandler(async(req,res)=>{
    //step 1: get the file from user
   const resumeLocalPath = await  req.file?.path;
    //step 2: check for empty file

    if (!resumeLocalPath) {
        throw new apiError(400,"File(resume) not found")
    }

   const Resume = await uploadOnCloudinary(resumeLocalPath)

   if (!Resume) {
    throw new apiError(400,"Resume link not found ")
    
   }

    
    //step 4: return res
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            Resume.url,
            "File (resume) uploaded successfully"
        )
    )


})
export {uploadeResume}