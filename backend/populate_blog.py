import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from blog.models import BlogPost

posts = [
    {
        "title": "The Rise of Smart Factories: AI's Role in Industry 4.0",
        "slug": "smart-factories-ai-industry-4-0",
        "category": "Industrial Tech",
        "excerpt": "How artificial intelligence and IoT are transforming traditional manufacturing into data-driven smart factories.",
        "image_url": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
        "author": "Dr. Arin Verma",
        "content": """
            <h2>The Fourth Industrial Revolution</h2>
            <p>Industry 4.0 is not just a buzzword; it's a fundamental shift in how we produce goods. At the heart of this revolution is <strong>Artificial Intelligence</strong>.</p>
            <h3>Predictive Maintenance</h3>
            <p>Gone are the days of 'run-to-failure'. AI algorithms now analyze vibration and thermal data from machines to predict breakdowns weeks before they happen, saving millions in downtime.</p>
            <h3>Digital Twins</h3>
            <p>engineers enable creating virtual replicas of physical systems. This allows for risk-free testing of new operational parameters.</p>
            <blockquote>"The factory of the future will have only two employees: a man and a dog. The man will be there to feed the dog. The dog will be there to keep the man from touching the equipment." - Warren Bennis</blockquote>
        """
    },
    {
        "title": "Data Science Career Roadmap: Junior to Chief Data Officer",
        "slug": "data-science-career-roadmap",
        "category": "Career Growth",
        "excerpt": "A comprehensive guide to climbing the data ladder, from mastering SQL to leading enterprise AI strategies.",
        "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        "author": "Sarah Chen",
        "content": """
            <h2>The Path to Leadership</h2>
            <p>Data Science is maturing. It's no longer enough to just build models; you need to build <em>value</em>.</p>
            <h3>Phase 1: The Technician</h3>
            <p>Focus on Python, SQL, and core ML algorithms. Your job is to execute.</p>
            <h3>Phase 2: The Strategist</h3>
            <p>Learn to translate business problems into data questions. Start thinking about ROI and scalability.</p>
            <h3>Phase 3: The Executive</h3>
            <p>As a CDO, your code matters less than your governance framework. Your role is to build a data-driven culture.</p>
        """
    },
    {
        "title": "Engineering Your Resume: Precision Tips for Technical Roles",
        "slug": "engineering-your-resume",
        "category": "Resume Tips",
        "excerpt": "Stop using generic templates. Here is how to structure a technical resume that speaks the language of engineering managers.",
        "image_url": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
        "author": "Tech Recruiting Team",
        "content": """
            <h2>Quantify Your Impact</h2>
            <p>Engineers love numbers. Don't say "Improved performance". Say <strong>"Reduced API latency by 40% (200ms to 120ms) by optimizing DB queries"</strong>.</p>
            <h3>The Tech Stack Section</h3>
            <p>Organize skills by proficiency or category (e.g., specific Languages, Frameworks, Infrastructure). Do not list things you used once 5 years ago.</p>
            <h3>Projects over Duties</h3>
            <p>Focus on what you built. Include links to GitHub repositories where code quality can be verified.</p>
        """
    },
    {
        "title": "Hard Skills vs. Soft Skills in 2026",
        "slug": "hard-skills-vs-soft-skills-2026",
        "category": "Future Risks",
        "excerpt": "As AI automates coding and analysis, human-centric skills like empathy and complex problem-solving are becoming the new premium.",
        "image_url": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
        "author": "Edu2Job Research",
        "content": """
            <h2>The Paradox of Automation</h2>
            <p>As machines get better at being machines, humans must get better at being human.</p>
            <h3>Critical Thinking</h3>
            <p>AI can give you an answer, but can you judge if it's the <em>right</em> answer? Evaluating AI outputs is a critical new skill.</p>
            <h3>Adaptive Learning</h3>
            <p>The ability to unlearn and relearn quickly is now more valuable than any single degree.</p>
        """
    },
    {
        "title": "Deep Work Systems for Remote Developers",
        "slug": "deep-work-for-developers",
        "category": "Productivity",
        "excerpt": "Mastering focus in a world of constant notifications. Strategies for maintaining flow state while working from anywhere.",
        "image_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
        "author": "Alex Rivera",
        "content": """
            <h2>The War on Attention</h2>
            <p>Productivity is not about doing more things; it's about doing the <em>right</em> things with intensity.</p>
            <h3>Time Blocking</h3>
            <p>Dedicate 4 hours of uninterrupted time to complex coding tasks. Turn off Slack. Put the phone in another room.</p>
            <h3>Asynchronous Communication</h3>
            <p>Stop expecting instant replies. Write better documentation so your team can work without tapping you on the shoulder virtually.</p>
        """
    }
]

print("Starting blog population...")
for post_data in posts:
    obj, created = BlogPost.objects.update_or_create(
        slug=post_data['slug'],
        defaults=post_data
    )
    action = "Created" if created else "Updated"
    print(f"{action}: {post_data['title']}")

print("Done! 5 Industrial-style posts ready.")
