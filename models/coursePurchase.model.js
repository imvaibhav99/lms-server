import mongoose from 'mongoose';

const coursePurchaseSchema= new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course reference is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    amount: {
        type : Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        default: 'USD'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required']
    },
    paymentId: {
        type: String,
        required: [true, 'Payment ID is required'],
      
    },
    refundId: {
        type: String,
    },
    refundAmount: {
        type: Number,
        min: [0, 'Refund amount cannot be negative'],
    },
    refundReason: {
        type: String,
    },
    metadata: {          
        type: Map,        //to store any additional info in key-value pairs
        of: String
    }

}, { timestamps: true,
  toJSON: {virtuals: true}, //to include virtuals when toJSON is called
  toObject: {virtuals: true}
});

coursePurchaseSchema.index({user: 1, course: 1}) //for uniquely identifying user and course combination
coursePurchaseSchema.index({status: 1});
coursePurchaseSchema.index({createdAt: -1}); //find it HW

coursePurchaseSchema.virtual('isRefundable').get(function(){
    if(this.status !== 'completed'){
        return false;
    }
    const thirtyDasPeriod= new Date(this.now()-30*24*60*60*1000);
    return this.createdAt >= thirtyDasPeriod;
})

//method to process refund
coursePurchaseSchema.methods.processRefund= async function(reason, amount){
    this.status= 'refunded';
    this.reason= reason;
    this.refundAmount= amount|| this.amount;
    return this.save();
    
}

export const CoursePurchase= mongoose.model('CoursePurchase', coursePurchaseSchema);

// export con CoursePurchase;