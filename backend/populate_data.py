import os
import django
import sys
import random

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import TrainingData

def populate_data():
    TOTAL_RECORDS = 1000000 # Targeted 1 Million for high accuracy without crashing
    BATCH_SIZE = 5000
    print(f"Generating {TOTAL_RECORDS} realistic training records with diverse roles...")
    
    # Define archetypes for realistic data generation
    archetypes = {
        "Frontend Developer": {
            "degrees": ["B.Tech", "B.Sc", "BCA", "M.Tech", "MCA"],
            "specializations": ["Computer Science", "Information Technology", "Computer Applications"],
            "skills": ["HTML", "CSS", "JavaScript", "React", "Angular", "Vue.js", "Redux", "TypeScript", "Bootstrap", "Tailwind CSS", "Figma", "Git", "Webpack"],
            "certifications": ["Meta Frontend Developer", "Certified React Developer", "Google UX Design", "Adobe Certified Expert"]
        },
        "Backend Developer": {
            "degrees": ["B.Tech", "M.Tech", "MCA", "B.E"],
            "specializations": ["Computer Science", "Information Technology", "Electronics"],
            "skills": ["Python", "Java", "Node.js", "Django", "Spring Boot", "Express.js", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Docker", "AWS", "Go", "Rust"],
            "certifications": ["AWS Certified Developer", "Oracle Certified Professional: Java", "MongoDB Certified Developer", "Microsoft Certified: Azure Developer"]
        },
        "Full Stack Developer": {
            "degrees": ["B.Tech", "M.Tech", "MCA"],
            "specializations": ["Computer Science", "Information Technology"],
            "skills": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", "MongoDB", "SQL", "Git", "AWS", "Docker", "GraphQL", "Next.js"],
            "certifications": ["AWS Certified Developer", "Meta Full Stack Developer", "IBM Full Stack Software Developer"]
        },
        "Data Scientist": {
            "degrees": ["M.Tech", "M.Sc", "PhD", "B.Tech"],
            "specializations": ["Data Science", "Computer Science", "Statistics", "Mathematics"],
            "skills": ["Python", "R", "SQL", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Matplotlib", "Tableau", "Power BI", "Big Data", "Spark"],
            "certifications": ["Google Data Analytics", "IBM Data Science", "Microsoft Certified: Azure Data Scientist", "AWS Certified Machine Learning"]
        },
        "Data Analyst": {
            "degrees": ["B.Sc", "B.Com", "B.Tech", "MBA"],
            "specializations": ["Statistics", "Mathematics", "Economics", "Computer Science"],
            "skills": ["Excel", "SQL", "Tableau", "Power BI", "Python", "R", "Google Analytics", "SAS", "Data Visualization"],
            "certifications": ["Google Data Analytics", "Microsoft Certified: Power BI Data Analyst", "IBM Data Analyst"]
        },
        "DevOps Engineer": {
            "degrees": ["B.Tech", "M.Tech", "MCA"],
            "specializations": ["Computer Science", "Information Technology", "Electronics"],
            "skills": ["Linux", "Python", "Bash", "Docker", "Kubernetes", "Jenkins", "Ansible", "Terraform", "AWS", "Azure", "Git", "CI/CD", "Prometheus", "Grafana"],
            "certifications": ["CKA (Certified Kubernetes Administrator)", "AWS Certified DevOps Engineer", "Microsoft Certified: DevOps Engineer", "HashiCorp Certified: Terraform Associate"]
        },
        "Cloud Developer": {
            "degrees": ["B.Tech", "M.Tech", "BCA"],
            "specializations": ["Computer Science", "Information Technology"],
            "skills": ["AWS", "Azure", "Google Cloud", "Python", "Java", "Node.js", "Serverless", "Lambda", "Docker", "Kubernetes", "Microservices"],
            "certifications": ["AWS Certified Developer", "Microsoft Certified: Azure Developer", "Google Professional Cloud Developer"]
        },
        "Mobile App Developer": {
            "degrees": ["B.Tech", "BCA", "MCA"],
            "specializations": ["Computer Science", "Information Technology"],
            "skills": ["Java", "Kotlin", "Swift", "Flutter", "React Native", "Dart", "Firebase", "Android Studio", "Xcode", "Git"],
            "certifications": ["Google Associate Android Developer", "Meta iOS Developer", "Flutter Certified Application Developer"]
        },
        "UI/UX Designer": {
            "degrees": ["B.Des", "B.Sc", "B.A", "B.Tech"],
            "specializations": ["Design", "Multimedia", "Computer Science", "Arts"],
            "skills": ["Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "InVision", "HTML", "CSS", "User Research", "Wireframing", "Prototyping"],
            "certifications": ["Google UX Design", "CalArts UI/UX Design", "Interaction Design Foundation Certification"]
        },
        "Cyber Security Analyst": {
            "degrees": ["B.Tech", "M.Tech", "B.Sc"],
            "specializations": ["Cyber Security", "Computer Science", "Information Technology"],
            "skills": ["Network Security", "Ethical Hacking", "Python", "Linux", "Wireshark", "Metasploit", "SIEM", "Firewalls", "Cryptography", "Risk Assessment", "Penetration Testing"],
            "certifications": ["CEH (Certified Ethical Hacker)", "CompTIA Security+", "CISSP", "CISM", "OSCP"]
        },
        "AI/ML Engineer": {
            "degrees": ["M.Tech", "B.Tech", "PhD"],
            "specializations": ["Artificial Intelligence", "Computer Science", "Robotics"],
            "skills": ["Python", "TensorFlow", "PyTorch", "Keras", "OpenCV", "NLP", "Deep Learning", "Reinforcement Learning", "Scikit-learn", "MLOps"],
            "certifications": ["DeepLearning.AI TensorFlow Developer", "AWS Certified Machine Learning", "Google Professional Machine Learning Engineer"]
        },
        "Blockchain Developer": {
            "degrees": ["B.Tech", "M.Tech"],
            "specializations": ["Computer Science", "Information Technology"],
            "skills": ["Solidity", "Ethereum", "Smart Contracts", "Web3.js", "Rust", "Hyperledger", "Cryptography", "Go", "Truffle"],
            "certifications": ["Certified Blockchain Developer", "Ethereum Developer Certification"]
        },
        "Game Developer": {
            "degrees": ["B.Tech", "BCA", "B.Sc"],
            "specializations": ["Computer Science", "Game Design", "Animation"],
            "skills": ["C++", "C#", "Unity", "Unreal Engine", "3D Math", "OpenGL", "DirectX", "Blender", "Game Physics"],
            "certifications": ["Unity Certified Programmer", "Unreal Engine Certification"]
        },
        "Software Developer": {
            "degrees": ["B.Tech", "BCA", "MCA", "B.Sc"],
            "specializations": ["Computer Science", "Information Technology"],
            "skills": ["Java", "Python", "C++", "C#", "SQL", "Git", "Data Structures", "Algorithms", "OOP", "System Design"],
            "certifications": ["Oracle Certified Professional", "Microsoft Certified: Azure Fundamentals"]
        },
        "QA Engineer": {
            "degrees": ["B.Tech", "BCA", "MCA"],
            "specializations": ["Computer Science", "Information Technology"],
            "skills": ["Selenium", "Java", "Python", "JIRA", "TestNG", "Cucumber", "Manual Testing", "Automation Testing", "API Testing", "Postman"],
            "certifications": ["ISTQB Certified Tester", "Selenium Certification"]
        }
    }

    records_to_create = []
    
    for i in range(TOTAL_RECORDS):
        # Pick a random role
        role = random.choice(list(archetypes.keys()))
        archetype = archetypes[role]
        
        # Generate random attributes based on archetype
        degree = random.choice(archetype["degrees"])
        specialization = random.choice(archetype["specializations"])
        
        # Pick 3-8 random skills (increased variety)
        num_skills = random.randint(3, 8)
        skills = ", ".join(random.sample(archetype["skills"], min(num_skills, len(archetype["skills"]))))
        
        # Pick 0-3 random certifications
        num_certs = random.randint(0, 3)
        if num_certs > 0:
            certifications = ", ".join(random.sample(archetype["certifications"], min(num_certs, len(archetype["certifications"]))))
        else:
            certifications = ""
            
        records_to_create.append(TrainingData(
            degree=degree,
            specialization=specialization,
            skills=skills,
            certifications=certifications,
            target_job_role=role
        ))

        # Batch Insert
        if len(records_to_create) >= BATCH_SIZE:
            TrainingData.objects.bulk_create(records_to_create)
            if (i + 1) % 50000 == 0:
                print(f"Inserted {i+1} records...")
            records_to_create = []

    # Insert remaining records
    if records_to_create:
        TrainingData.objects.bulk_create(records_to_create)
        print(f"Inserted final batch of {len(records_to_create)} records.")

    print(f"Successfully added {TOTAL_RECORDS} records.")

if __name__ == '__main__':
    populate_data()
