# 🎓 Edu2Job: AI-Powered Career Guidance Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Active-success.svg)
![Python](https://img.shields.io/badge/python-3.8%2B-blue)
![React](https://img.shields.io/badge/react-18.x-61DAFB)
![Django](https://img.shields.io/badge/django-4.x-092E20)

## 📖 Overview

**Edu2Job** is a comprehensive platform designed to bridge the gap between education and employment. By leveraging advanced Machine Learning algorithms and Generative AI (Gemini), Edu2Job analyzes user profiles—including education, skills, and certifications—to predict suitable job roles and provide actionable career guidance.

Whether you are a student looking for your first job or a professional seeking a career transition, Edu2Job provides personalized insights to help you succeed.

---

## ✨ Key Features

### 🚀 **For Students & Job Seekers**
- **AI Job Prediction**: Get accurate job role recommendations based on your degree, specialization, and skills using our custom Random Forest model.
- **Skill Gap Analysis**: Identify missing skills for your target roles and get recommendations on how to acquire them.
- **Resume Optimization**: Receive AI-driven suggestions to enhance your resume and profile.
- **Community Interaction**: Engage with peers, share experiences, and get advice in the community forum.
- **Career Roadmap**: Visualized paths to reach your career goals.

### 🛠 **For Administrators**
- **Interactive Dashboard**: Gain insights into user demographics, prediction trends, and system usage.
- **Model Management**: Retrain and update the machine learning models directly from the dashboard with new data.
- **User Management**: Efficiently oversee user roles and permissions.
- **Feedback Loop**: Monitor user feedback on predictions to continuously improve model accuracy.

---

## 🏗️ Tech Stack

### **Frontend**
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS / Material UI
- **Animations**: Framer Motion
- **State Management**: React Context / Hooks

### **Backend**
- **Framework**: Django REST Framework (DRF)
- **Language**: Python
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **Authentication**: JWT (JSON Web Tokens) & Google OAuth

### **AI & Machine Learning**
- **Models**: Random Forest Classifier (Scikit-learn)
- **Generative AI**: Google Gemini API (for personalized content and context-aware suggestions)
- **Data Processing**: Pandas, NumPy

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### **Prerequisites**
- Python 3.8+
- Node.js & npm
- Git

### **Backend Setup**

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Rajesh248810/Edu2Job.git
    cd Edu2Job/backend
    ```

2.  **Create and activate a virtual environment**
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```

3.  **Install dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run migrations**
    ```bash
    python manage.py migrate
    ```

5.  **Start the development server**
    ```bash
    python manage.py runserver
    ```

### **Frontend Setup**

1.  **Navigate to the frontend directory**
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

---

## 📸 Screenshots

*(Add screenshots of your application here)*

| Landing Page | Job Prediction |
|:---:|:---:|
| ![Landing Page Placeholder](https://via.placeholder.com/400x200?text=Landing+Page) | ![Job Prediction Placeholder](https://via.placeholder.com/400x200?text=Prediction+Result) |

| Admin Dashboard | User Profile |
|:---:|:---:|
| ![Admin Dashboard Placeholder](https://via.placeholder.com/400x200?text=Admin+Dashboard) | ![Profile Placeholder](https://via.placeholder.com/400x200?text=User+Profile) |

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

**Dev Team** - [Email](mailto:contact@edu2job.com)

Project Link: [https://github.com/Rajesh248810/Edu2Job](https://github.com/Rajesh248810/Edu2Job)
