import mongoose from "mongoose";

const courseSchema= new mongoose.Schema({
    title:{
        type: String,
        required: [true, 'Course title is required'],
        trim:true,
        maxLength: [100, 'Course title cannot exceed 100 characters']
    },
    subtitle:{
         type: String,
        required: [true, 'Course title is required'],
        trim:true,
        maxLength: [100, 'Course subtitle cannot exceed 200 characters']
    },
    description: {
        type:String,
        trim:true,
    },
    category:{
        type: String,
        required: [true, 'Category is required'],
        trim: true,
    },
    level:{
        type: String,
        enum:{
            values: ['beginner','intermediate','advanced'],
            message: 'Please select a valid level'
        },
        default: 'beginner'
    },
    price:{
        type: Number,
        required: [true, 'Course Price is required'],
        minValue: [0, 'Course price must be a non-negative number']
    },
    thumbnail:{
        type: String,
        required: [true, 'Course thumbnail is required']
    },
    enrolledStudents:{
        type: Object.Schema.Types.ObjectId,
        ref: 'User'
    },
    lectures: [{
        type: Object.Schema.Types.ObjectId,
        ref: 'Lecture'
    }],
    instructor:{
        type: Object.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Course instructor is required']
    },
    isPublished:{
        type: Boolean,
        default: false
    },
    totalDuration:{
        type:Number,
        default: 0
    },
    totalLectures:{
        type: Number,
        default: 0
    }
},
{
        timestamps: true,
  toJSON: {virtuals: true}, //to include virtuals when toJSON is called
  toObject: {virtuals: true}
    }
);

courseSchema.virtual('averagerating').get(function(){
    return 0;
})

courseSchema.pre('save',function(next){
    if(this.lecture){
         this.totalLectures= this.lectures.length;
    }
   next();
})

//write for rating and comment of particular users

export  const Course= mongoose.model('Course', courseSchema);