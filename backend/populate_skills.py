import os
import django
import random

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User, Education, Certification, Skill, JobPlacement

# --- MAPPINGS ---

EDUCATION_SKILLS = {
    'Computer Science': ['Python', 'Java', 'C++', 'Data Structures', 'Algorithms', 'DBMS', 'Operating Systems'],
    'Information Technology': ['Web Development', 'Networking', 'Database Management', 'Java', 'Python'],
    'Electronics': ['Embedded Systems', 'IoT', 'Verilog', 'MATLAB', 'Circuit Design'],
    'Mechanical': ['AutoCAD', 'SolidWorks', 'Thermodynamics', 'Fluid Mechanics'],
    'Civil': ['AutoCAD', 'Revit', 'Structural Analysis', 'Surveying'],
    'Data Science': ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'Pandas', 'NumPy'],
    'Artificial Intelligence': ['Python', 'Deep Learning', 'Neural Networks', 'TensorFlow', 'PyTorch'],
    'Cyber Security': ['Network Security', 'Ethical Hacking', 'Cryptography', 'Linux'],
    'Business': ['Management', 'Communication', 'Marketing', 'Finance', 'Excel'],
    'Commerce': ['Accounting', 'Finance', 'Taxation', 'Excel'],
}

CERTIFICATION_KEYWORDS = {
    'AWS': ['AWS', 'Cloud Computing', 'DevOps'],
    'Azure': ['Azure', 'Cloud Computing'],
    'Google Cloud': ['GCP', 'Cloud Computing'],
    'Python': ['Python', 'Scripting'],
    'Java': ['Java', 'OOP'],
    'Web': ['HTML', 'CSS', 'JavaScript', 'React'],
    'React': ['React', 'Redux', 'JavaScript'],
    'Node': ['Node.js', 'Express', 'Backend'],
    'Data': ['Data Analysis', 'SQL', 'Python'],
    'Machine Learning': ['Machine Learning', 'Python', 'Scikit-learn'],
    'Cyber': ['Cyber Security', 'Network Security'],
}

JOB_ROLE_SKILLS = {
    'Software Engineer': ['System Design', 'Git', 'Agile', 'Problem Solving'],
    'Data Analyst': ['SQL', 'Tableau', 'Power BI', 'Excel', 'Data Visualization'],
    'System Engineer': ['Linux', 'Bash', 'Networking', 'System Administration'],
    'Web Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    'Full Stack Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'SQL'],
    'Backend Developer': ['Python', 'Java', 'Node.js', 'SQL', 'API Design'],
    'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Redux'],
    'Data Scientist': ['Python', 'Machine Learning', 'Deep Learning', 'NLP', 'Statistics'],
    'Product Manager': ['Product Management', 'Agile', 'User Research', 'Strategy'],
    'QA Engineer': ['Selenium', 'Manual Testing', 'Automation Testing', 'Java', 'Python'],
    'DevOps Engineer': ['Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'AWS'],
    'Business Analyst': ['Business Analysis', 'SQL', 'Excel', 'Communication'],
    'Consultant': ['Consulting', 'Problem Solving', 'Communication', 'Strategy'],
}

def get_skills_from_education(education):
    skills = set()
    if not education:
        return skills
    
    # Check specialization first
    spec = education.specialization
    if spec:
        for key, val in EDUCATION_SKILLS.items():
            if key.lower() in spec.lower():
                skills.update(val)
    
    # Check degree if no skills found yet or to add more
    degree = education.degree
    if degree:
        if 'B.Tech' in degree or 'B.E' in degree or 'BCA' in degree or 'MCA' in degree:
             skills.update(['Programming', 'Problem Solving'])
    
    return skills

def get_skills_from_certs(certs):
    skills = set()
    for cert in certs:
        name = cert.cert_name
        for key, val in CERTIFICATION_KEYWORDS.items():
            if key.lower() in name.lower():
                skills.update(val)
    return skills

def get_skills_from_job(placement):
    skills = set()
    if not placement:
        return skills
    
    role = placement.role
    for key, val in JOB_ROLE_SKILLS.items():
        if key.lower() in role.lower():
            skills.update(val)
    
    return skills

def populate_skills():
    users = User.objects.all()
    print(f"Found {users.count()} users.")

    for user in users:
        print(f"Processing {user.name}...")
        current_skills = set(s.skill_name for s in user.skills.all())
        new_skills = set()

        # 1. Education Skills
        education = user.education_set.first() # Assuming one education for now
        edu_skills = get_skills_from_education(education)
        new_skills.update(edu_skills)

        # 2. Certification Skills
        certs = user.certification_set.all()
        cert_skills = get_skills_from_certs(certs)
        new_skills.update(cert_skills)

        # 3. Job Placement Skills
        placement = user.placements.first() # Access via related_name 'placements'
        job_skills = get_skills_from_job(placement)
        new_skills.update(job_skills)

        # 4. Default skills if empty (Basic soft skills)
        if not new_skills and not current_skills:
            new_skills.update(['Communication', 'Teamwork', 'Problem Solving'])

        # Save new skills
        count = 0
        for skill_name in new_skills:
            if skill_name not in current_skills:
                Skill.objects.create(user=user, skill_name=skill_name)
                count += 1
        
        print(f"  Added {count} new skills.")

if __name__ == '__main__':
    print("Starting skill population...")
    try:
        populate_skills()
        print("Done!")
    except Exception as e:
        print(f"An error occurred: {e}")


