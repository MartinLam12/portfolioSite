import os
from flask import Flask, render_template, request
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

# ── Work Experience Data ─────────────────────────────────────────────────────
experiences = [
    {
        'role': 'Software Engineer Intern',
        'company': 'Tech Company Inc.',
        'start': 'Jun 2024',
        'end': 'Aug 2024',
        'location': 'San Francisco, CA',
        'icon': '💻',
        'bullets': [
            'Built and shipped features used by 10,000+ daily active users.',
            'Collaborated with senior engineers on REST API design and optimization.',
            'Reduced page load time by 30% through lazy loading and caching strategies.',
        ],
        'tags': ['Python', 'React', 'PostgreSQL'],
    },
    {
        'role': 'Data Analyst',
        'company': 'Analytics Co.',
        'start': 'Jan 2024',
        'end': 'May 2024',
        'location': 'Remote',
        'icon': '📊',
        'bullets': [
            'Developed dashboards that visualized KPIs for C-suite stakeholders.',
            'Automated weekly reporting pipeline, saving 6 hours of manual work per week.',
            'Performed A/B testing analysis that guided a product redesign decision.',
        ],
        'tags': ['SQL', 'Python', 'Tableau'],
    },
    {
        'role': 'Web Developer',
        'company': 'Freelance',
        'start': 'Sep 2023',
        'end': 'Dec 2023',
        'location': 'Remote',
        'icon': '🌐',
        'bullets': [
            'Designed and deployed responsive websites for 5 small business clients.',
            'Integrated payment APIs and contact form backends for client projects.',
            'Maintained ongoing client relationships and delivered on tight deadlines.',
        ],
        'tags': ['HTML', 'CSS', 'JavaScript'],
    },
]

# ── Hobbies Data ─────────────────────────────────────────────────────────────
hobbies_data = [
    {
        'name': 'Photography',
        'category': 'Creative',
        'emoji': '🌐',
        'image': 'https://picsum.photos/seed/photography/800/500',
        'desc': 'I love capturing moments — from street photography in the city to landscapes on hiking trails. My camera is almost always within reach.',
        'featured': True,
    },
    {
        'name': 'Hiking',
        'category': 'Outdoor',
        'emoji': '⛺',
        'image': 'https://picsum.photos/seed/hiking/600/400',
        'desc': "Trail running and hiking are my go-to for clearing my head. There's nothing like reaching a summit with a good view.",
        'featured': False,
    },
    {
        'name': 'Cooking',
        'category': 'Food',
        'emoji': '🍳',
        'image': 'https://picsum.photos/seed/cooking/600/400',
        'desc': 'Cooking is my creative outlet in the kitchen. I enjoy experimenting with new cuisines and hosting dinner nights for friends.',
        'featured': False,
    },
    {
        'name': 'Gaming',
        'category': 'Gaming',
        'emoji': '🎮',
        'image': 'https://picsum.photos/seed/gaming2024/600/400',
        'desc': 'From indie games to competitive FPS titles — gaming is how I unwind and connect with friends online.',
        'featured': False,
    },
    {
        'name': 'Music',
        'category': 'Music',
        'emoji': '🎵',
        'image': 'https://picsum.photos/seed/music2024/600/400',
        'desc': 'I play guitar and enjoy discovering new artists across genres. Music is always playing in the background when I code.',
        'featured': False,
    },
    {
        'name': 'Reading',
        'category': 'Learning',
        'emoji': '📚',
        'image': 'https://picsum.photos/seed/reading2024/600/400',
        'desc': 'I read mostly non-fiction — tech, psychology, and history. Currently working through a book on systems thinking.',
        'featured': False,
    },
]

# ── Routes ───────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html', title="MLH Fellow", url=os.getenv("URL"))


@app.route('/work-experience')
def work_experience():
    return render_template('work_experience.html', experiences=experiences)


@app.route('/hobbies')
def hobbies():
    return render_template('hobbies.html', hobbies=hobbies_data)
