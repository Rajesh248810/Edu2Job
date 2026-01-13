import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from blog.models import BlogPost

posts = [
    {
        "title": "Top 10 Emerging Tech Jobs in 2026",
        "slug": "top-10-emerging-tech-jobs-2026",
        "category": "Career Trends",
        "excerpt": "Discover the most in-demand roles in the technology sector and what skills you need to land them.",
        "image_url": "https://source.unsplash.com/random/800x600/?technology,office",
        "content": """
            <h2>The Future of Work is Here</h2>
            <p>The technology landscape is shifting rapidly. As AI becomes ubiquitous, new roles are emerging that didn't exist five years ago.</p>
            <h3>1. AI Prompt Engineer</h3>
            <p>Mastering the art of communicating with Large Language Models...</p>
            <h3>2. Sustainability Data Analyst</h3>
            <p>Companies are racing to meet ESG goals...</p>
            <h3>3. Edge Computing Specialist</h3>
            <p>With IoT devices multiplying, processing data closer to the source...</p>
        """
    },
    {
        "title": "How to Build a Resume that Stands Out",
        "slug": "how-to-build-resume-stands-out",
        "category": "Career Advice",
        "excerpt": "Learn the secrets to creating a resume that passes ATS scanners and catches recruiters' eyes.",
        "image_url": "https://source.unsplash.com/random/800x600/?resume,writing",
        "content": """
            <h2>Beat the ATS</h2>
            <p>Applicant Tracking Systems (ATS) filter out 75% of resumes before a human ever sees them. Here is how to pass the test.</p>
            <ul>
                <li>Use standard headings like 'Experience' and 'Education'.</li>
                <li>Incorporate keywords from the job description.</li>
                <li>Avoid complex graphics or tables.</li>
            </ul>
        """
    },
    {
        "title": "The Importance of Continuous Learning",
        "slug": "importance-of-continuous-learning",
        "category": "Personal Growth",
        "excerpt": "Why certifications and lifelong learning are your best assets in a rapidly changing job market.",
        "image_url": "https://source.unsplash.com/random/800x600/?learning,library",
        "content": """
            <h2>Stay Relevant</h2>
            <p>The half-life of a learned skill is now only 5 years. Continuous learning is no longer a luxury, it is a necessity.</p>
            <blockquote>"Live as if you were to die tomorrow. Learn as if you were to live forever." - Mahatma Gandhi</blockquote>
        """
    }
]

for post_data in posts:
    obj, created = BlogPost.objects.get_or_create(
        slug=post_data['slug'],
        defaults=post_data
    )
    if created:
        print(f"Created: {post_data['title']}")
    else:
        print(f"Already exists: {post_data['title']}")
