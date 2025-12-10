import os
import django
import random
from datetime import date, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User, JobPlacement

# Data for random generation
COMPANIES = [
    "Google", "Microsoft", "Amazon", "Infosys", "TCS", "Wipro", "Accenture", 
    "IBM", "Deloitte", "Capgemini", "HCL", "Tech Mahindra", "Oracle", 
    "Adobe", "Salesforce", "Flipkart", "Uber", "Ola", "Zomato", "Swiggy"
]

ROLES = [
    "Software Engineer", "Data Analyst", "System Engineer", "Web Developer", 
    "Full Stack Developer", "Backend Developer", "Frontend Developer", 
    "Data Scientist", "Product Manager", "QA Engineer", "DevOps Engineer",
    "Business Analyst", "Consultant"
]

def populate_placements():
    # 1. Get all students
    # Assuming 'student' is the role name. Adjust if it's 'Student' or something else.
    # Based on previous context, it seems to be lowercase 'student'.
    students = list(User.objects.filter(role='student'))
    total_students = len(students)
    
    if total_students == 0:
        print("No students found to place.")
        return

    print(f"Total Students: {total_students}")

    # 2. Calculate 40%
    target_count = int(total_students * 0.40)
    print(f"Target Placements (40%): {target_count}")

    # 3. Randomly select students
    selected_students = random.sample(students, target_count)

    # 4. Create placements
    created_count = 0
    for student in selected_students:
        # Check if already placed to avoid duplicates if run multiple times
        if JobPlacement.objects.filter(user=student).exists():
            print(f"  Skipping {student.name} (already placed)")
            continue

        company = random.choice(COMPANIES)
        role = random.choice(ROLES)
        placement_type = random.choice(['Job', 'Job', 'Job', 'Internship']) # 75% chance of Job
        
        # Random date in the last 2 years or next 6 months
        start_date = date.today() - timedelta(days=365*2)
        end_date = date.today() + timedelta(days=180)
        days_between = (end_date - start_date).days
        random_days = random.randrange(days_between)
        date_of_joining = start_date + timedelta(days=random_days)

        JobPlacement.objects.create(
            user=student,
            role=role,
            company=company,
            placement_type=placement_type,
            date_of_joining=date_of_joining
        )
        created_count += 1
        print(f"  Placed {student.name} at {company} as {role}")

    print(f"\nSuccessfully created {created_count} new placement records.")

if __name__ == '__main__':
    print("Starting placement population...")
    try:
        populate_placements()
        print("Done!")
    except Exception as e:
        print(f"An error occurred: {e}")
