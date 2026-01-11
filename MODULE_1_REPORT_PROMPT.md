
You are an expert technical writer. Create a comprehensive project report for **"Module 1: User Authentication and Profile Management"** of the **"Edu2Job"** application.

**Role:** Technical Documentation Specialist
**Tone:** Professional, Technical, and Structured
**Visual Style for Output:** Request a colorful, clean layout (e.g., "Use Blue/White professional theme").

---

### **Report Structure Requirements:**

**1. Title Page:**
   - **Project Name:** Edu2Job
   - **Module:** Module 1: User Authentication and Profile Management
   - **Status:** Completed
   - **Date:** [Insert Date]

**2. Introduction:**
   - Provide a brief overview of the module.
   - **Goal:** To establish a secure and user-friendly foundation for the application, handling user identity (Registration/Login) and data management (Profiles).

**3. Key Features Implemented:**
   - **Secure Authentication:** JSON Web Token (JWT) based login and registration.
   - **Google OAuth Integration:** Seamless one-click login using Google accounts.
   - **User Dashboard:** A central interactive hub displaying user stats and navigation.
   - **Editable Profile Management:** Dynamic forms to add/edit:
     - *Education* (Degree, API-based University Search)
     - *Certifications* & *Skills*
     - *Job Placements*

**4. Implementation Details (Code & Logic):**
   *Please include the following verified code snippets in the report to demonstrate technical implementation. Format them as code blocks.*

   **A. Backend Model (User & Education) - `backend/users/models.py`**
   ```python
   class User(models.Model):
       user_id = models.AutoField(primary_key=True)
       name = models.CharField(max_length=100)
       email = models.CharField(unique=True, max_length=100)
       password_hash = models.CharField(max_length=255)
       role = models.CharField(max_length=20)
       # ...

   class Education(models.Model):
       user = models.ForeignKey(User, models.CASCADE) 
       degree = models.CharField(max_length=50)
       university = models.CharField(max_length=100)
       cgpa = models.DecimalField(max_digits=3, decimal_places=2) 
       # ...
   ```

   **B. JWT Login Logic - `backend/users/views.py`**
   ```python
   class LoginView(APIView):
       def post(self, request):
           # ... check user credentials ...
           payload = {
               'user_id': user.user_id,
               'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
               'iat': datetime.datetime.utcnow()
           }
           token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
           return Response({'message': 'Login Successful', 'token': token, ...})
   ```

   **C. Frontend Login Component - `frontend/src/Components/LoginForm.tsx`**
   ```tsx
   const handleSubmit = async (e: React.FormEvent) => {
     try {
       const response = await axios.post(`${API_BASE_URL}/api/login/`, {
         email, password
       });
       login(response.data.user, response.data.token);
       navigate('/dashboard');
     } catch (err: any) {
       setError("Login Failed");
     }
   };
   ```

**5. Output Screenshots (Placeholders):**
   *Please leave large, distinct placeholders for me to insert screenshots later.*
   - **[INSERT SCREENSHOT: LOGIN PAGE WITH GOOGLE BUTTON HERE]**
   - **[INSERT SCREENSHOT: USER DASHBOARD HERE]**
   - **[INSERT SCREENSHOT: PROFILE EDIT FORM HERE]**

**6. Conclusion:**
   - Summarize that Module 1 is fully functional, secure, and ready for integration with the Job Prediction Module.

---

**Instruction for AI:**
Generate the full content of this report based on the details above. Use bold formatting for emphasis and clear headers.
