import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config();


const connectDB = async () => {
try {
const user = process.env.DB_USER;
const pass = process.env.DB_PASS;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT || '27017';
const name = process.env.DB_NAME;


const authPart = user && pass ? `${user}:${encodeURIComponent(pass)}@` : "";
const uri = `mongodb://${authPart}${host}:${port}/${name}`;


await mongoose.connect(uri, {
// options if needed
// useNewUrlParser: true, useUnifiedTopology: true are defaults in mongoose v6+
});
console.log("MongoDB connected");
} catch (error) {
console.error("MongoDB connection error:", error);
process.exit(1);
}
};


export default connectDB;
