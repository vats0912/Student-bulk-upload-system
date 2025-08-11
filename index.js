import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app=express()
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectToRabbitMQ } from './utils/rabbitmq.js'
import userRouter from './routes/Student.js'; 
const server=http.createServer(app) 

app.use(cors())
app.use(express.json())


mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.use('/user',userRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await connectToRabbitMQ();
});