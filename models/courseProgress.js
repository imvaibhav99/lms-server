import mongoose from 'mongoose';

const lectureProgressSchema = new mongoose.Schema({
    lecture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture', 
        required: [true, 'Lecture reference is required']
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    watchTime: {
        type: Number,
        default: 0
    },
    lastWatched: {
        type: Date,
        default: Date.now
    }
})

const courseProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course reference is required']
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    lecturesProgress: [lectureProgressSchema], //referencing to the lecture progress schema
    lastAccessed: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true,
  toJSON: {virtuals: true}, //to include virtuals when toJSON is called
  toObject: {virtuals: true}
});

//calculate course progress
courseProgressSchema.pre('save', function(next){
    if(this.lecturesProgress.length > 0){
        const completedLectures= this.lectureProgress.filter(lp => lp.
            isCompleted).length
          this.completionPercentage= Math.round((completedLectures/ this.lecturesProgress.length)*100);
          this.isCompleted= this.completionPercentage === 100;
        }
    next();
})


//update last accessed method
courseProgressSchema.methods.updateLastAccessed= function(){  //calling as a function to update the last accessed time everytime the course is watched
    this.lastAccessed=Date.now();
    return this.save({validateBeforeSave: false});
}


const CourseProgress= mongoose.model('CourseProgress', courseProgressSchema);  //not the lecture progress schema as it is a subdocument used in courseProgressSchema