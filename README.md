# SSSAM Batch Management System 🎓

A full-stack, role-based Batch Scheduling & Trainer Allocation Web Application built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **MongoDB (Mongoose ODM)**.

---

## 🌟 Key Features

### 👑 1. Counselor (Super Admin Portal) - Full Access
- **Trainer Management**: Register new trainers, view faculty profiles, and check their daily timetable & workload.
- **Batch Management**: Create, edit, and delete batches with Course, Trainer, Daily Timings, Days of Week (Weekdays Mon-Thu / Weekend Sat-Sun), Classroom, and Capacity.
- **Intelligent Schedule Conflict Detection**: Prevents double-booking trainers by checking time overlaps on identical days.
- **Student Roster & Enrollment**: Enroll new students into batches and remove/transfer existing students.
- **Master Timetable Matrix**: Visual weekly & daily schedule grid across all trainers and classrooms.

### 🧑‍🏫 2. Trainer Portal - Role-Protected Access
- **My Batches & Timings**: Access assigned batches, timings, and classroom details.
- **Student Enrollment**: **Trainers CAN add and enroll new students** into their assigned batches.
- **Student Removal Protection**: **Trainers CANNOT delete or remove students** from batches (strictly blocked on UI and secured on Backend API with `403 Forbidden`).
- **Session Activity Logging**: Log daily topics covered and student attendance.

---

## ⚙️ MongoDB Database Setup

1. Create a `.env.local` file in the root directory:
```env
# Local MongoDB:
MONGODB_URI=mongodb://127.0.0.1:27017/sssam_batch_management

# Or MongoDB Atlas (Cloud Cluster):
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sssam_batch_management?retryWrites=true&w=majority

JWT_SECRET=sssam_batch_management_secret_key_2026_secure
```

2. When you start the application, it connects to MongoDB and initializes the **Counselor Admin** account automatically with zero dummy/test data:
- **Email**: `counselor@sssam.com`
- **Password**: `admin123`

---

## 🚀 How to Run

### Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```
