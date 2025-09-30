// import express from "express";
// import morgan from "morgan"
// import dotenv from "dotenv";
// import rateLimit from "express-rate-limit";
// import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize";
// import hpp from "hpp";
// import cookieParser  from "cookie-parser";
// import cors from "cors";
// import healthRoute from "./routes/health.routes.js"
// import userRoute from "./routes/user.routes.js"

// dotenv.config();

// const app=express();
// const PORT=process.env.PORT

// //Global rate limiting
// const limiter= rateLimit({
//     windowMs:15*60*1000,
//     max:100,
//     message:"Too many requests from this IP, please try again after 15 minutes"
// })

// //Security middleware
// app.use(helmet());
// app.use(mongoSanitize());
// app.use(hpp());
// app.use("/api",limiter);




// //logging middleware morgan only in dev mode
// if(process.env.NODE_ENV==="development"){
//     app.use(morgan("dev"))
// }

// //Body Parser Middleware-to restrict the size of the incoming req data
// app.use(express.json({limit: '10kb'}))
// app.use(express.urlencoded({extended: true, limit: '10kb'}))
// app.use(cookieParser());




// //Global Error Handlers
// app.use((err,req,res,next)=>{
//     console.error(err.stack); //Prints the full stack trace of the error in the console
//     res.status(err.status||500).json({
//         status:'error',
//         message: err.message|| 'Internal Server Error',
//         ...(process.env.NODE_ENV==='development' && {stack: err.stack})

//     });
// });

// //CORS configuration->best practice 
// app.use(cors({
//     origin:process.env.CLIENT_URL||"http://localhost:5173",
//     credentials:true,
//     methods:["GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS"],
//     allowedHeaders: ["Content-Type",
//         "Authorization",
//         "X-Requested-With",
//         "device-remember-token",
//         "Access-Control-Allow-Origin",
//         "Origin",
//         "Accept",
//     ],
// }))


// //API Routes localhost:4000/api/v1/user/...

// app.use("/health", healthRoute);
// app.use("api/v1/user", userRoute);


// //404 handler,always at the bottom
// app.use((req,res)=>{
//     res.status(404).json({
//         status:"error",
//         message:"Route not found"
//     })
// })
// app.listen(PORT,()=>{
//     console.log(`Server is running on ${PORT} in ${process.env.NODE_ENV} mode`);
    
// })


import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cors from "cors";

import healthRoute from "./routes/health.routes.js";
import userRoute from "./routes/user.routes.js";
import connectDB from "./database/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// trust proxy (important if behind reverse proxy like Vercel/Heroku)
app.set("trust proxy", 1);

// rate limiting -> applied to /api routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter);

// security middlewares
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());

// logging only in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// cors config
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "device-remember-token",
      "Origin",
      "Accept",
    ],
  })
);

// body parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// routes
app.use("/", healthRoute); // -> GET /health
app.use("/api/v1/user", userRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// global error handler (last middleware)
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// start server after db connect
const start = async () => {
  try {
    await connectDB(process.env.DATABASE_URL);
    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
      );
    });
  } catch (error) {
    console.error("Failed to connect DB:", error);
    process.exit(1);
  }
};

start();
