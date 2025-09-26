import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from crypto;  // for generating salted hash

const userSchema= new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim:true,
        maxLength: [50, 'Name cannot exceed 50 characters']
    },
      email: {
        type: String,
        required: [true, 'Email is required'],
        trim:true,
        unique: true,
        lowercase:true,
        match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
      password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [50, 'Password must be 8 characters'],
        select: false //never want to select this by default to be shared in res.json
    },
    role: {
      type: String,
      enum:{
        values: ['student','instructor','admin'],
        message: 'Plase select a valid role'
      },
      default: 'student'
    },
    avatar:{
      type: String,
      default: 'default-avatar.png'
    },
    bio:{
      type: String,
      maxLength:[200, 'Bio cannot exceed 200 characters']
    },
    enrolledCourses:[{
      course:{
           type: mongoose.Schema.Types.ObjectId, //referencing the course model
           ref: 'Course'
      },
      enrolledAt:{
          type: Date,
          default: Date.now
      }
     
    }],
    createdCourses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course'
    }],
    resetPasswordToken:String,
    resetPasswordExpire:Date,
    lastActive: {
    type: Date,
    default: Date.now
    }
  }
,{timestamps: true,
  toJSON: {virtuals: true}, //to include virtuals when toJSON is called
  toObject: {virtuals: true} //to include virtuals when toObject is called
}
  );
 

//hashing the password before saving the user->it is like a middleware
userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next(); //only hash the password if it has been modified or is new
  this.password= await bcrypt.hash(this.password, 12)
  next();
})

//compare password method->called automatically,not a middleware so no next;
userSchema.methods.comparePassword= async function(enterPassword){
  return await bcrypt.compare(enterPassword, this.password)
}

userSchema.methods.getResetPasswordToken= function(){
  const token= crypto.randomBytes(20).toString('hex'); //generate a random token
  this.resetPasswordToken= crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex'); //hash the token and set to resetPasswordToken field
        this.resetPasswordTokenExpire= Date.now()+10*60*1000 //10 minutes
        return resetToken
}

//last active update field
userSchema.methods.updateLastActive= function(){
  this.lastActive= Date.now();
  return this.lastActive({validateBeforeSave: false}); //to avoid running the validators again,so that just this can be saved
}

//virtual fields for the total enrolled courses
userSchema.virtual('totalEnrolledCourses').get(function(){
  return this.enrolledCourses.length
})


export const User= mongoose.model('User', userSchema )