# Project Report: Edu2Job - Module 1

**Module Name:** User Authentication and Profile Management
**Status:** Completed
**Date:** December 11, 2025

---

## 1. Introduction

**Edu2Job** is an AI-powered career guidance platform designed to bridge the gap between education and employment. **Module 1** serves as the foundation of this platform, establishing secure user identity management and comprehensive data collection.

The primary goal of this module was to create a secure environment where students can register, authenticate via standard or social login, and build a detailed professional profile. This profile data—encompassing education, skills, and certifications—serves as the critical input for the AI-driven job prediction algorithms in subsequent modules.

## 2. Key Features Implemented

### 2.1 Secure Authentication System
*   **JWT (JSON Web Token) Implementation:** We implemented a stateless authentication mechanism. Upon login, the server issues a secure, time-limited token that the frontend uses for all subsequent API requests, ensuring secure sessions without server-side storage overhead.
*   **Role-Based Access Control (RBAC):** The system distinguishes between 'Student' and 'Admin' roles, routing users to their respective dashboards (Student Dashboard vs. Admin Analytics).

### 2.2 Social Login Integration
*   **Google OAuth 2.0:** Integrated "Sign in with Google" to lower entry barriers. This uses the OAuth 2.0 protocol to securely verify user identity via Google servers, automatically creating an account if one doesn't exist.

### 2.3 Comprehensive Profile Management
A dynamic, multi-section profile form allows users to build their digital resume:
*   **Education History:** detailed records of degrees, specializations, and CGPA.
*   **AI-Powered Autocomplete:** Integrated **Gemini AI** to provide smart, context-aware suggestions for fields like "University", "Degree", and "Skills" as the user types.
*   **Certifications & Skills:** dedicated sections to add professional credentials.
*   **Job Placements:** tracking usage of past employment data for analytics.

---

## 3. Technical Implementation

### 3.1 Backend Architecture (Django)

**Database Design:**
We utilized a relational model to link user entities with their professional attributes.

*File: `backend/users/models.py`*
```python
class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.CharField(unique=True, max_length=100)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=20)

class Education(models.Model):
    user = models.ForeignKey(User, models.CASCADE) 
    degree = models.CharField(max_length=50)
    specialization = models.CharField(max_length=100)
    university = models.CharField(max_length=100)
    cgpa = models.DecimalField(max_digits=3, decimal_places=2) 
```

**Authentication Logic:**
The login view verifies credentials and mints a JWT token.

*File: `backend/users/views.py`*
```python
class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        # ... validation logic ...
        
        payload = {
            'user_id': user.user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
            'iat': datetime.datetime.utcnow()
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return Response({'message': 'Login Successful', 'token': token, 'user': serializer.data})
```

### 3.2 Frontend Architecture (React)

**Login Component:**
Handles form submission and token storage.

*File: `frontend/src/Components/LoginForm.tsx`*
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/login/`, {
      email, password
    });
    // Store user data in global context
    login(response.data.user, response.data.token);
    navigate('/dashboard');
  } catch (err: any) {
    setError("Login Failed");
  }
};
```

**AI Autocomplete Integration:**
We enhanced the user experience with intelligent suggestions.

*File: `frontend/src/Components/ProfileForm.tsx`*
```tsx
<AsyncAutocomplete
  label="Degree"
  value={eduData.degree}
  onChange={(val) => setEduData({ ...eduData, degree: val || '' })}
  // Hits the backend endpoint powered by Gemini
  apiEndpoint="/api/suggest/?type=degree"
  required={!eduData.degree}
/>
```

---

## 4. User Interface

*(Please insert your screenshots in the placeholders below)*

**Figure 4.1: Login Page**
_Features the "Sign in with Google" button and email/password form._

![LOGIN PAGE SCREENSHOT PLACEHOLDER]

**Figure 4.2: User Dashboard**
_The central hub displaying user welcome message and navigation cards._

![DASHBOARD SCREENSHOT PLACEHOLDER]

**Figure 4.3: Profile Management**
_The multi-step form for adding education and skills._

![PROFILE FORM SCREENSHOT PLACEHOLDER]

---

## 5. Conclusion

Module 1 has been successfully deployed and tested. The secure authentication layer is stable, and the rich profile data collection mechanism is ready. This establishes the necessary data infrastructure for **Module 2: AI Job Prediction**, where we will utilize the collected student data to train our prediction models.
