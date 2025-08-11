import mongoose from 'mongoose';
import express from 'express';
import multer from 'multer';
import ExcelJS from 'exceljs';
import Student from '../models/Student.js';
import { publishStudent } from '../utils/rabbitmq.js'; 
import { promises as fs } from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

const router = express.Router();

router.post('/bulk-upload', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0];
    const rows = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; 
      const student = {
        studentName: row.getCell(1).value?.toString().trim(),
        middleName: row.getCell(2).value?.toString().trim(),
        lastName: row.getCell(3).value?.toString().trim(),
        studentEmail: row.getCell(4).value?.toString().trim(),
        mobile_no: row.getCell(5).value?.toString().trim(),
        parent_mobile_no: row.getCell(6).value?.toString().trim(),
        dateOfBirth: new Date(row.getCell(7).value),
        class: row.getCell(8).value?.toString().trim(),
        board: row.getCell(9).value?.toString().trim(),
        address: row.getCell(10).value?.toString().trim(),
        city: row.getCell(11).value?.toString().trim(),
        state: row.getCell(12).value?.toString().trim(),
        pincode: row.getCell(13).value?.toString().trim(),
      };
      rows.push(student);
    });

    const errors = [];
    const alreadyExistingStudents = [];
    const validStudents = [];

    const emailsInFile = rows.map(row => row.studentEmail).filter(Boolean);

    const existingStudents = await Student.find({
      studentEmail: { $in: emailsInFile }
    }).select('studentEmail');

    const existingEmailSet = new Set(existingStudents.map(s => s.studentEmail));

    for (let student of rows) {
      const {
        studentName,
        lastName,
        studentEmail,
        mobile_no,
        parent_mobile_no,
        dateOfBirth,
        class: className,
        board,
        address,
        city,
        state,
        pincode
      } = student;

      if (
        !studentName || !lastName || !studentEmail || !mobile_no ||
        !parent_mobile_no || !dateOfBirth || !className || !board ||
        !address || !city || !state || !pincode
      ) {
        errors.push({ studentEmail, error: 'Validation failed: Required fields missing' });
        continue;
      }

      if (existingEmailSet.has(studentEmail)) {
        alreadyExistingStudents.push(student);
        continue;
      }

      try {
        await publishStudent({
          action: 'create',
          student,
        }); 
        validStudents.push(student);
        console.log(student)

      } catch (err) {
        console.error('Error publishing to queue:', err.message);
        errors.push({ studentEmail, error: 'Failed to publish to queue' });
      }
    }

    res.json({
      success: true,
      inserted: validStudents.length,
      exist: alreadyExistingStudents.length,
      failed: errors.length,
      errors,
      alreadyExistingStudents,
    });

  } catch (err) {
    console.error('Bulk upload error:', err);
    res.status(500).send('Error in bulk upload');
  } finally {
    try {
      await fs.unlink(filePath);
      console.log(`Deleted uploaded file: ${filePath}`);
    } catch (err) {
      console.error(`Failed to delete file: ${filePath}`, err);
    }
  }
});


router.get('/student', async (req, res) => {
  const { studentEmail } = req.query;
  try {
    const student = await Student.findOne({ studentEmail });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ student, message: 'Fetched Successfully' });
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/delete', async (req, res) => {
  const { studentEmail } = req.query;
  try {
    const exist = await Student.findOne({ studentEmail });
    if (exist) {
      await Student.deleteOne({ studentEmail });
      return res.status(200).json({
        student: exist,
        msg: 'Deleted successfully',
      });
    }

    return res.status(404).json({ msg: 'Student not found' });
  } catch (err) {
    console.error('Error in deletion', err);
    return res.status(500).json({ msg: 'Error in deletion', error: err.message });
  }
});

export default router;
