import { User } from '../models/user.model.js';
import { ApiError, catchAsync }  from '../middleware/error.middleware.js';
import {generateToken } from "../utils/generateToken.js"
import {deleteMediaFromCloudinary, uploadMedia} from "../utils/cloudinary.js"

//signup
export const createUserAccount = catchAsync(async (req ,res ,next)=>{
    const {name, email, password, role='student'}= req.body;
    //we will do validations globally

    const existingUser= await User.findOne({email: email.toLowerCase()});

    if(existingUser){
        throw new ApiError('User already exists', 400);
    }

    const user= await User.create({
        name,
        email:email.toLowerCase(),
        password,
        role

    })
    await user.updateLastActive();
    generateToken(res, user, 'Account created successfully')
})

//login
export const authenticateUser= catchAsync(async (req,res)=>{
    const {email, password}= req.body;
    const user= User.findOne({email: email.toLowerCase()}).select('+password')  //to select password feild amnually as it is not selected by default

    if(!user || !(await user.comparePassword(password))){   //called the comparePassword method
        throw new ApiError("Invalid email or password", 401)
    }

    await user.updateLastActive();
    generateToken(res, user, `Welcome back &{user.name}`)
})

//signout and expiring the cookies
export const signOutUser= catchAsync(async (req,res)=>{
    res.cookie("token","",{ maxAge: 0});
    res.status(200).json({
        success: true,
        message: "Signed out successfully"
    })
})

export const getCurrentUserProfile= catchAsync(async(req,res)=>{
     const user = User.findById(req.id).populate({
        path: "enrolledCourses.course",  //path from user model to enrolledCourse to course model
        select: 'title thumbnail description'
     });

    if(!user){
        throw new ApiError("User not found", 404);
    }
    res.status(200).json({
        success: true,
        data:{
            ...user.toJSON(),
            totalEnrolledCourses: user.totalEnrolledCourses
        }
    })
})

export const updateUserProfile= catchAsync(async(req,res)=>{
    const {name, email, bio}= req.body;
    const updateData={
        name,
        email: email?.toLowerCase(),
        bio
    };
    if(req.file){
       const avatarResult= await uploadMedia(req.filt.path)
       updateData.avatar= avatarResult.secure_url

       //delete old avatar
       const user= await User.findById(req.id)
       if(user.avatar && user.avatar!= 'default-avatar.png'){
                await deleteMediaFromCloudinary(user.avatar)
       }
    }
    //update user and get updated doc

    const updatedUser= await User.findByIdAndUpdate(
        req.id,
        updateData,
        {new: true, runValidators: true}
    )
    if(!updatedUser){
        throw new ApiError("User not found",404)
    }
    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully",
        data: updatedUser
    });
});
