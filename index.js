import express from "express"
import connectDB from "./config/db"

const app = express()
connectDB()

app.listen(3000, () => console.log("Server runing on 3000") )