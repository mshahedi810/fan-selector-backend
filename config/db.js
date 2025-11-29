import mongoose from "mongoose"

const connectDB = async () => {
    try {
        await
        mongoose.connect("mongodb://ipAddress/projectName")
        console.log("mongoDB connected")
    } catch (error) {
        console.log("mongoDB connection Error", error)
    }
}

export default connectDB