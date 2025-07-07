# 🏥 30-Day Hospital Readmission Prediction - Frontend

This is the **frontend** of the Capstone Project for predicting 30-day hospital readmissions. It is built using **React** and communicates with a FastAPI backend to support hospital staff in identifying high-risk patients and managing post-discharge follow-ups effectively.

The app includes **role-based access** with separate modules for Admin and Nurse/User roles.

---

## 🚀 Features

### Login System

- Role-based login (Admin or User)
- Persistent session storage using localStorage ( as of now )
- Route protection for authorized views

---

## 👥 User Types

### 👤 Nurse/User Module

Accessible after logging in with a **User** role.

**Key Responsibilities:**

- View and manage **tasks** (e.g., follow-up calls, home visits)
- View assigned **patient list**, sorted by readmission risk
- Access individual **patient profiles**
  - View patient details
  - Log and view **follow-up actions**
  - View predicted readmission status
- Trigger **re-prediction** based on updated patient information

---

### 🛠️ Admin Module

Accessible after logging in with an **Admin** role.

**Key Responsibilities:**

- View all high-priority patients across the system
- Manage all follow-ups and task assignments
- Handle **priority escalation** workflows
- Approve or reject escalated cases
- Oversee the overall prediction system and audit log

---

## 🛠️ Tech Stack

- **Frontend:** React (CRA)
- **State Management:** React Hooks, Context API
- **Routing:** React Router DOM
- **Authentication:** Dummy auth as of now (session-based)
- **Styling:** Tailwind CSS
