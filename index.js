import express from "express";
import morgan from "morgan"
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser  from "cookie-parser";
import cors from "cors";
import healthRoute from "./routes/health.routes.js"
import userRoute from "./routes/user.routes.js"

dotenv.config();

const app=express();
const PORT=process.env.PORT

//Global rate limiting
const limiter= rateLimit({
    windowMs:15*60*1000,
    max:100,
    message:"Too many requests from this IP, please try again after 15 minutes"
})

//Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());
app.use("/api",limiter);




//logging middleware morgan only in dev mode
if(process.env.NODE_ENV==="development"){
    app.use(morgan("dev"))
}

//Body Parser Middleware-to restrict the size of the incoming req data
app.use(express.json({limit: '10kb'}))
app.use(express.urlencoded({extended: true, limit: '10kb'}))
app.use(cookieParser());




//Global Error Handlers
app.use((err,req,res,next)=>{
    console.error(err.stack); //Prints the full stack trace of the error in the console
    res.status(err.status||500).json({
        status:'error',
        message: err.message|| 'Internal Server Error',
        ...(process.env.NODE_ENV==='development' && {stack: err.stack})

    });
});

//CORS configuration->best practice 
app.use(cors({
    origin:process.env.CLIENT_URL||"http://localhost:5173",
    credentials:true,
    methods:["GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS"],
    allowedHeaders: ["Content-Type",
        "Authorization",
        "X-Requested-With",
        "device-remember-token",
        "Access-Control-Allow-Origin",
        "Origin",
        "Accept",
    ],
}))


//API Routes localhost:4000/api/v1/user/...

app.use("/health", healthRoute);
app.use("api/v1/user", userRoute);


//404 handler,always at the bottom
app.use((req,res)=>{
    res.status(404).json({
        status:"error",
        message:"Route not found"
    })
})
app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT} in ${process.env.NODE_ENV} mode`);
    
})
