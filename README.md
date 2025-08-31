<h1 align="center">📂 Student Bulk Upload System</h1>
<p align="center">
  <em>Backend system to upload, manage, and query student data using Node.js, Express.js, RabbitMQ, and Multer</em>
</p>

---

## ✨ Overview
The **Student Bulk Upload System** is a backend project that allows institutions to manage student records at scale.  

It supports:  
- 📤 **Bulk upload** student data from Excel files  
- 🗑️ **Delete** student records  
- 🔍 **Fetch** student information on demand  

This system uses **RabbitMQ message queues** to handle bulk data processing asynchronously, ensuring scalability and reliability for large datasets.  

---

## 🚀 Features
- 📑 **Excel File Upload** → Upload student data via `.xlsx` file  
- 🗃️ **Multer Storage** → Handles file parsing & temporary storage  
- 📤 **RabbitMQ Queue** → Ensures asynchronous and scalable data processing  
- 🗑️ **Delete Students** → API to delete student records  
- 🔍 **Get Student Info** → Query specific student details  
- ⚡ **Fully Backend** → Designed as an API-first service  

---

## 🛠️ Tech Stack
**Backend**  
<p>
  <img src="https://skillicons.dev/icons?i=nodejs,express" />
</p>

**Message Queue & Storage**  
<p>
  <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" />
  <img src="https://img.shields.io/badge/Multer-007ACC?style=for-the-badge&logo=node.js&logoColor=white" />
</p>

**Database (Optional)**  
<p>
  <img src="https://skillicons.dev/icons?i=mongodb" />
</p>

---

## ⚡ Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/student-bulk-upload.git
cd student-bulk-upload
2️⃣ Install Dependencies
npm install

3️⃣ Setup Environment Variables

Create a .env file and configure:

PORT=5000
MONGO_URI=your_mongodb_uri
RABBITMQ_URL=amqp://localhost

4️⃣ Start RabbitMQ

Make sure RabbitMQ is running locally or in Docker:

rabbitmq-server


or using Docker:

docker run -d --hostname my-rabbit --name rabbitmq -p 5672:5672 rabbitmq:3

5️⃣ Run the Server
npm start

📌 API Endpoints
1. 📤 Upload Students
POST /user/bulk-upload


Accepts: .xlsx file (via Multer)

Processes: Bulk upload student data asynchronously via RabbitMQ

2. 🗑️ Delete Student
DELETE /user/student


Deletes a student record by ID

3. 🔍 Get Student Info
GET /user/delete


Fetches student details by email

📸 Example Flow

Upload students.xlsx file → sent to backend

Backend pushes data processing job to RabbitMQ queue

Worker consumes queue and inserts students into database

API allows fetching/deleting specific student records
