import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectToRabbitMQ, consumeStudents } from './utils/rabbitmq.js';
import Student from './models/Student.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);
console.log('✅ MongoDB connected');
console.log('Listening to queue')

const processStudent = async (msg) => {
  try {
    const rawContent = msg.content.toString();
    const parsed = JSON.parse(rawContent);

    if (!parsed || parsed.action !== 'create' || !parsed.student) {
      console.warn('⚠️ Invalid message format:', parsed);
      return;
    }

    const data = parsed.student;
    console.log(data)

    
    const requiredFields = [
      'studentName', 'lastName', 'studentEmail',
      'mobile_no', 'parent_mobile_no', 'dateOfBirth',
      'class', 'board', 'address', 'city', 'state', 'pincode'
    ];

    const missing = requiredFields.filter(field => !data[field]);
    if (missing.length > 0) {
      console.error(` Missing required fields: ${missing.join(', ')}`);
      return;
    }

    const existing = await Student.findOne({ studentEmail: data.studentEmail });
    if (existing) {
      console.log(` Student already exists: ${data.studentEmail}`);
      return;
    }

    await Student.create(data);
    console.log(` Student saved: ${data.studentEmail}`);
  } catch (err) {
    console.error(' Error processing student:', err.message);
  }
};

const start = async () => {
  await connectToRabbitMQ();
  await consumeStudents(processStudent);
};

start();
