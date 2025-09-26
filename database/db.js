import mongoose from 'mongoose';

const MAX_RETRIES = 3; //maxinum no. fo retires for connection
const RETRY_INTERVAL= 5000; // 5 seconds

class DatabaseConnection{
    
    constructor(){
        this.retryCount=0;
        this.isConnected=false;

        //configure mongoose options
        mongoose.set('strictQuery',true);

        mongoose.connection.on('connected',()=>{
            console.log("MONGODB CONNECTED SUCCESSFULLY");
            this.isConnected=true;
        });
         mongoose.connection.on('error',()=>{
            console.log("MONGODB CONNECTION ERROR",err);
             this.isConnected=false;
        });
         mongoose.connection.on('disconnected',()=>{
            console.log("MONGODB DISCONNECTED");
     
             //TODO: attempt a reconnection
             this.handleDisConnection()
        });
        process.on('SIGTERM',this.handleAppTermination.bind(this)); //in constructor bind the method to the class instance

    }

    async connect(){
       try {
         if(!process.env.MONGO_URI){
             throw new Error("Mongo DB URI is not defined in the env variables")
         }
 
         const connectionOptions={
             useNewUrlParser:true,
             useUnifiedTopology:true,
             maxPoolSize:10, //maximum number of connections in the pool
             serverSelectionTimeoutMS: 5000,
             socketTimeoutMS: 45000,
             family: 4 // use Ipv4 skip Ipv6
         };
 
         if(process.env.NODE_ENV ==='development'){
             mongoose.set('debug',true);
         }
         await mongoose.connect(process.env.MONGO_URI, connectionOptions);
         this.retryCount=0; //reset retry count on successful connection
       } catch (error) {
            console.error(error.message);
            await this.handleConnectionError();
       }

    }

    async handleConnectionError(){
        if(this.retryCount < MAX_RETRIES){
            this.retryCount++;
            console.log(`Retrying to connect... Attempt ${this.retryCount} of ${MAX_RETRIES}`);
            await new Promise(resolve => setTimeout(()=>{
                resolve
            },RETRY_INTERVAL))
            return this.connect();
        }else{
            console.error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts.`);
            process.exit(1); //exit the process with failure
        }
    }

    async handleDisConnection(){
        if(!this.isConnected){
            console.log("Attempting to reconnect to MONGODB...");
            this.connect();
        }
    }

    async handleAppTermination(){
        try{
            await mongoose.connection.close();
            console.log("MONGODB CONNECTION CLOSED DUE TO APP TERMINATION");
            process.exit(0);
        }catch(error){
            console.error("Error during DB disconnection", error);
            process.exit(1);
        }
    }

    getConnectionStatus(){
        return{
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host:mongoose.connection.host,
            name:mongoose.connection.name
        }
    }
}

//create a singleton instance
const dbConnection = new DatabaseConnection();

export default dbConnection.connect.bind(dbConnection);  //bind calls the method with class
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection);