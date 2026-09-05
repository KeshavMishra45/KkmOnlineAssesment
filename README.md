# 🎓 KKM Classroom — Online Assessment Platform

> A full-stack online assessment platform for teachers and students, featuring secure authentication, exam management, performance analysis, and coding assessments.

---

## 📌 Overview

**KKM Classroom** is an online assessment platform designed to simplify the process of creating, conducting, and analyzing examinations.

The platform provides separate experiences for **Teachers** and **Students**. Teachers can create and manage exams, view student submissions, and analyze performance, while students can attempt assessments and view their results.

The application also supports **coding-based assessments** with code execution through Judge0.

---

## ✨ Features

### 👨‍🏫 Teacher Module

- Secure teacher authentication
- Create and manage examinations
- Create questions using the question builder
- View submitted student attempts
- View examination results
- Analyze student performance
- View class average and high/low scores
- View pass/fail statistics
- View per-student performance

### 👨‍🎓 Student Module

- Secure student authentication
- Student dashboard
- View available examinations
- Attempt assessments
- Submit examination answers
- View examination analysis
- Access coding examinations

### 💻 Coding Assessment

- Dedicated coding examination workflow
- Online code submission
- Code execution using Judge0
- Support for programming-based assessment workflows

### 🔐 Security & Access Control

- Session-based authentication
- Role-based route protection
- Teacher-only and student-only areas
- Server-side authentication checks
- MongoDB-backed user accounts

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React** | User interface |
| **TypeScript** | Type-safe development |
| **TanStack Start** | Full-stack application framework |
| **Tailwind CSS** | Styling and responsive UI |
| **MongoDB Atlas** | Database |
| **MongoDB Node.js Driver** | Database connectivity |
| **Judge0** | Code execution |
| **Node.js** | Runtime |
| **npm** | Package management |

---

## 🏗️ Application Architecture

```text
                    ┌─────────────────────┐
                    │       React UI      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   TanStack Start    │
                    │   Routes / Server   │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
       ┌──────────────────┐        ┌──────────────────┐
       │ Authentication   │        │ Application      │
       │ & Sessions       │        │ Logic            │
       └────────┬─────────┘        └────────┬─────────┘
                │                           │
                └─────────────┬─────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │    MongoDB Atlas    │
                    │       Database      │
                    └─────────────────────┘