import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"


const connectDB = async() =>{

try {
      const connectDataBase = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
             console.log(`\nMongoDB is Connected !! DB HOST :${connectDataBase.connection.host}`)
                return connectDataBase; // ✅ ADD THIS
      
} catch (error) {
    console.log(error,"Error while connecting with mongoDB index file");
    
    
}
}
export default connectDB;

























// // import  mongoose  from "mongoose"
// import mongoose from "mongoose"

// const dbConnection = async()=>
// {
//     try {
//        const connectDb = await mongoose.connect(`${process.env.MONGODB_URI}`)
//         console.log("Connected to MongoDB successfully ")
//     } catch (error) {

//         console.log(error,"Something wentwrong while making connection with mongodb")
        
//     }
// }
// export default dbConnection