import joblib
import os
import pandas as pd
from django.conf import settings


# Define required skills for each role (Extend this list as needed)
ROLE_SKILLS_MAPPING = {
    "Software Engineer": ["Python", "Java", "Data Structures", "Algorithms", "SQL", "Git"],
    "Software Developer": ["Python", "Java", "C++", "SQL", "Git", "Problem Solving"],
    "Data Scientist": ["Python", "Machine Learning", "Deep Learning", "SQL", "Pandas", "NumPy"],
    "Web Developer": ["HTML", "CSS", "JavaScript", "React", "Node.js"],
    "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "Redux", "TypeScript"],
    "Backend Developer": ["Python", "Django", "Node.js", "SQL", "REST APIs", "Docker"],
    "Full Stack Developer": ["HTML", "CSS", "JavaScript", "React", "Node.js", "SQL", "MongoDB"],
    "Mobile App Developer": ["Java", "Kotlin", "Swift", "Flutter", "React Native"],
    "Game Developer": ["C++", "C#", "Unity", "Unreal Engine", "Mathematics"],
    "Embedded Systems Engineer": ["C", "C++", "Microcontrollers", "RTOS", "Electronics"],
    "DevOps Engineer": ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD"],
    "Cloud Architect": ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes"],
    "Cloud Developer": ["AWS", "Azure", "Python", "Docker", "Microservices"],
    "Data Analyst": ["Excel", "SQL", "Python", "Tableau", "Power BI"],
    "System Administrator": ["Linux", "Networking", "Bash Scripting", "Security"],
    "Database Administrator": ["SQL", "Oracle", "MySQL", "PostgreSQL", "Database Design"],
    "Network Engineer": ["Networking", "Cisco", "Routing", "Switching", "Firewalls"],
    "Cyber Security Analyst": ["Network Security", "Ethical Hacking", "Linux", "Python", "Cryptography"],
    "AI/ML Engineer": ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning"],
    "Blockchain Developer": ["Solidity", "Ethereum", "Smart Contracts", "Cryptography", "Blockchain"],
    "Civil Engineer": ["AutoCAD", "Structural Analysis", "Project Management", "Construction"],
    "Mechanical Design Engineer": ["SolidWorks", "AutoCAD", "Mechanical Design", "Thermodynamics"],
    "Project Manager": ["Agile", "Scrum", "Jira", "Communication", "Leadership"],
    "Business Analyst": ["SQL", "Excel", "Data Analysis", "Communication", "Requirements Gathering"],
    "UI/UX Designer": ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
    "QA Engineer": ["Selenium", "Java", "Python", "Testing", "Automation"],
    "Digital Marketer": ["SEO", "SEM", "Social Media Marketing", "Google Analytics", "Content Marketing"],
    "Financial Analyst": ["Finance", "Excel", "Financial Modeling", "Accounting", "Data Analysis"],
    "dev oops": ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD"], # Handling potential typo in model
    "developer devops": ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD"], # Handling potential typo in model
    "python stack": ["Python", "Django", "Flask", "SQL", "REST APIs", "Git"],
    "java stack": ["Java", "Spring Boot", "Hibernate", "SQL", "REST APIs", "Git"],
    "mern stack": ["MongoDB", "Express.js", "React", "Node.js", "JavaScript", "Git"],
    "mean stack": ["MongoDB", "Express.js", "Angular", "Node.js", "JavaScript", "Git"],
    "data science stack": ["Python", "Pandas", "NumPy", "Scikit-learn", "SQL", "Matplotlib"],
}

def predict_job(user_profile):
    """
    Predicts job role based on user profile.
    user_profile: dict containing 'degree', 'specialization', 'skills', 'certifications'
    """
    model_path = os.path.join(settings.BASE_DIR, 'ml_models', 'job_predictor.pkl')
    
    if not os.path.exists(model_path):
        return {"error": "Model not found. Please train the model first."}
    
    try:
        clf = joblib.load(model_path)
        
        # Prepare input dataframe
        user_skills_str = user_profile.get('skills', '')
        text_features = user_skills_str + " " + user_profile.get('certifications', '')
        
        input_data = pd.DataFrame([{
            'degree': user_profile.get('degree', ''),
            'specialization': user_profile.get('specialization', ''),
            'text_features': text_features
        }])
        
        # Predict
        probabilities = clf.predict_proba(input_data)[0]
        classes = clf.classes_
        
        # Get top 3 predictions
        top_indices = probabilities.argsort()[-3:][::-1]
        top_roles = []
        
        user_skills_list = [s.strip().lower() for s in user_skills_str.split(',') if s.strip()]

        for idx in top_indices:
            role = classes[idx]
            required_skills = ROLE_SKILLS_MAPPING.get(role, [])
            
            # Calculate missing skills
            missing_skills = [
                skill for skill in required_skills 
                if skill.lower() not in user_skills_list
            ]

            top_roles.append({
                "role": role,
                "confidence": round(float(probabilities[idx]) * 100, 2),
                "missing_skills": missing_skills
            })
        
        return {
            "predictions": top_roles
        }
        
    except Exception as e:
        return {"error": str(e)}
