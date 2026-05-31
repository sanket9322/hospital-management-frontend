# 🏥 Hospital Management System - Frontend

A modern **React.js** frontend for the Hospital Management System with Role-Based Dashboards for Admin, Doctor, and Patient.

---

## 🚀 Tech Stack

| Technology | Version |
|------------|---------|
| React.js | 18+ |
| React Router DOM | v6 |
| Axios | Latest |
| React Toastify | Latest |
| Context API | Built-in |
| CSS | Custom Styles |

---

## ✨ Features

- ✅ JWT Token Based Authentication
- ✅ Role Based Dashboards (ADMIN / DOCTOR / PATIENT)
- ✅ Book & Manage Appointments
- ✅ View Medical Records
- ✅ Doctor Listing
- ✅ Protected Routes
- ✅ Toast Notifications
- ✅ Responsive Design

---

## 📁 Project Structure

```
src/
├── context/
│   └── AuthContext.jsx        # Global Auth State
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── admin/
│   │   └── AdminDashboard.jsx
│   ├── doctor/
│   │   └── DoctorDashboard.jsx
│   └── patient/
│       └── PatientDashboard.jsx
├── services/
│   └── api.js                 # Axios Configuration
├── App.js
└── index.js
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- npm

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/sanket9322/hospital-management-frontend.git
cd hospital-management-frontend
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure API URL**

In `src/services/api.js`:
```js
const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});
```

**4. Run the application**
```bash
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | admin123 |
| Doctor | doctor@gmail.com | admin123 |
| Patient | patient@gmail.com | admin123 |

---

## 📌 Role Based Access

| Role | Dashboard | Features |
|------|-----------|----------|
| ADMIN | `/admin` | Manage Doctors, Patients, Appointments |
| DOCTOR | `/doctor` | View Appointments, Add Medical Records |
| PATIENT | `/patient` | Book Appointments, View Records, View Doctors |

---

## 🔗 Backend Repository

👉 [hospital-management-backend](https://github.com/sanket9322/hospital-management-backend)

---

## 👨‍💻 Author

**Sanket** — Full Stack Java Developer  
🔗 [GitHub](https://github.com/sanket9322) | [LinkedIn](https://linkedin.com/in/sanket9322)
