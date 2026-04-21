import dotenv from "dotenv";
dotenv.config();

import {v2 as cloudinary} from "cloudinary" 

import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_CLOUD_API,       // ✅ correct
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET // ✅ correct
});
// console.log("API KEY:", process.env.CLOUDINARY_CLOUD_API_KEY);
const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
        console.log("Attempting to upload file to Cloudinary:", localFilePath);
        
        if (!fs.existsSync(localFilePath)) {
            console.error("ERROR: Local file does not exist at path:", localFilePath);
            return null;
        }

        //upload  the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // file has been uploaded  successfully
        console.log("file is uploaded on cloudinary",
            response.url);
            // console.log("Uploading file:", localFilePath);
            fs.unlinkSync(localFilePath)//remove the  locally saved temp. file
            return response ; 
            
    } catch (error) {
        console.error("CLOUDINARY UPLOAD ERROR:", error); // Added detailed logging
        fs.unlinkSync(localFilePath)//remove the  locally saved temp. file  as the upload operation got failed 

        return null;
    }
}

export {uploadOnCloudinary}