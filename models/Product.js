import mongoose from "mongoose";


const PerformanceSchema = new mongoose.Schema({
airflow: Number,
staticPressure: Number,
power: Number,
efficiency: Number,
});


const ProductSchema = new mongoose.Schema({
id: Number,
model: String,
type: String,
manufacturer: String,
imageUrl: String,
description: String,
maxAirflow: Number,
maxStaticPressure: Number,
powerConsumption: Number,
motorRpm: Number,
noiseLevel: Number,
minTemp: Number,
maxTemp: Number,
fluidType: [String],
price: Number,
electricalSpecs: {
voltage: Number,
phase: Number,
frequency: Number,
},
dimensions: {
height: Number,
width: Number,
depth: Number,
},
performanceCurve: [PerformanceSchema],
});


export default mongoose.model("Product", ProductSchema);