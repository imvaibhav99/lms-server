//open razorpay docs->verify payment signature
//create just two controllers->createRazorpayOrder and verifyPayment
import Razorpay from "razorpay";
import crypto from 'crypto'

import {Course} from "../models/course.model.js"
import { CoursePurchase } from "../models/coursePurchase.model.js";

const razorpay= new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createRazorpayOrder= async (req ,res)=>{

    try{
        const userId= req.body;
        const {courseId}= req.body;

        const course= await Course.findById(courseId)
        if(!course) return res.status(404).json({message: "Course not found"})


        const newPurchase= new CoursePurchase({
            course: courseId,
            user: userId,
            amount: course.price,
            status: "pending"
        });

        const options= {
            amount: course.price * 100, //amount in paise(lowest currency)
            receipt:`course_${courseId}`,
            notes: {
                courseId: courseId,
                userId: userId
            }
        };

       const order= await razorpay.orders.create(options)

       newPurchase.paymentId= order.key_id;
       await newPurchase.save()

       res.status(200).json({
        success: true,
        order,
        course:{
            name: course.title,
            description: course.description,
        }
       })

    }catch(err){

        //TODO handle error
    }
}

export const verifyPayment= async(req,res)=>{

    try{
        const {razorpay_order_id,razorpay_payment_id, razorpay_signature}= req.body;

        const body= razorpay_order_id+"|"+razorpay_payment_id;
        const expectedSignture= crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex')

        const isAuthentic= expectedSignture===razorpay_signature;

        if(!isAuthentic){
            return res.status(400).json({message: "Payment verification failed"})

        }
        purchase.status= "completed";
        await purchase.save();

        res.status(200).json({
            success: true,
            message:"Payment verified successfully",
            courseId: purchase.courseId,
        })

    }catch(error){

    }
}