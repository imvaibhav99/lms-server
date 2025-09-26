import { v2 as cloudinary } from 'cloudinary'
import dotenv from "dotenv"

dotenv.config({})

//check and load env variables

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});

export const uploadMedia= async (file)=>{
    try{
        const uploadResponse= await cloudinary.uploader.upload(file, {
            resource_type: "auto", // This will automatically detect the file type (image, video, etc.)

        })
        return uploadResponse;
    }catch(error){
        console.log("Error in uploading media to Cloudinary");
        console.log(error);
    }
}

export const deleteMediaFromCloudinary= async (publicId)=>{
    try{
        await cloudinary.uploader.destroy(publicId);
    }catch(error){
        console.log("Error in deleting media from Cloudinary");
        console.log(error);
    }
}


export const deleteVideoFromCloudinary= async (publicId)=>{
    try{
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    }catch(error){
        console.log("Error in deleting media from Cloudinary");
        console.log(error);
    }
}