import mongoose from "mongoose";

const lectureSchema= new mongoose.Schema({
    title:{
        type: String,
        required: [true, 'Lecture title is required'],
        trim: true,
        maxLength: [100, 'Lecture title cannot exceed 100 characters']
    },
    description:{
        type: String,
        trim: true,
        maxLengthh: [500, 'Lecture description cannot exceed 500 characters']
    },
    videoUrl:{
        type: String,
        required: [true, 'Lecture video URL is required']
    },
    duration: {
        type: Number,
        default: 0
    },
    publicId:{
        type: String,
        required: [true, 'Lecture video public ID is required']
    },
    isPreview:{
        type: Boolean,
        default: false
    },
    order:{
        type: Number,
        required: [true, 'Lecture order is required']
    }
}
,{
        timestamps: true,
  toJSON: {virtuals: true}, //to include virtuals when toJSON is called
  toObject: {virtuals: true}
});

lectureSchema.pre('save', function(next){
    if(this.duration){
        this.duration= Math.round(this.duration*100)/100; //rounding to 2 decimal places
    }
    next();
})

export const Lecture= mongoose.model('Lecture', lectureSchema)