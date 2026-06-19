import os
from flask import Flask, render_template, request
from dotenv import load_dotenv

from app.education import education_bp

load_dotenv()
app = Flask(__name__)
app.register_blueprint(education_bp)

WORK_EXPERIENCE_ENTRIES = [
    {
        "role": "Software Engineer Intern",
        "company": "Tech Company Inc.",
        "dates": "Jun 2024 – Aug 2024",
        "location": "San Francisco, CA",
        "icon": "\U0001F4BB",
        "bullets": [
            "Built and shipped features used by 10,000+ daily active users.",
            "Collaborated with senior engineers on REST API design and optimization.",
            "Reduced page load time by 30% through lazy loading and caching strategies.",
        ],
        "tags": ["Python", "React", "PostgreSQL"],
    },
    {
        "role": "Data Analyst",
        "company": "Analytics Co.",
        "dates": "Jan 2024 – May 2024",
        "location": "Remote",
        "icon": "\U0001F4CA",
        "bullets": [
            "Developed dashboards that visualized KPIs for C-suite stakeholders.",
            "Automated weekly reporting pipeline, saving 6 hours of manual work per week.",
            "Performed A/B testing analysis that guided a product redesign decision.",
        ],
        "tags": ["SQL", "Python", "Tableau"],
    },
    {
        "role": "Web Developer",
        "company": "Freelance",
        "dates": "Sep 2023 – Dec 2023",
        "location": "Remote",
        "icon": "\U0001F310",
        "bullets": [
            "Designed and deployed responsive websites for 5 small business clients.",
            "Integrated payment APIs and contact form backends for client projects.",
            "Maintained ongoing client relationships and delivered on tight deadlines.",
        ],
        "tags": ["HTML", "CSS", "JavaScript"],
    },
]

HOBBIES = [
    {
        "title": "Photography",
        "seed": "photography",
        "category": "Creative",
        "category_icon": "\U0001F30C",
        "description": "I love capturing moments — from street photography in the city to landscapes on hiking trails. My camera is almost always within reach.",
        "featured": True,
    },
    {
        "title": "Hiking",
        "seed": "hiking",
        "category": "Outdoor",
        "category_icon": "\U0001F3D4",
        "description": "Trail running and hiking are my go-to for clearing my head. There's nothing like reaching a summit with a good view.",
        "featured": False,
    },
    {
        "title": "Cooking",
        "seed": "cooking",
        "category": "Food",
        "category_icon": "\U0001F373",
        "description": "Cooking is my creative outlet in the kitchen. I enjoy experimenting with new cuisines and hosting dinner nights for friends.",
        "featured": False,
    },
    {
        "title": "Gaming",
        "seed": "gaming2024",
        "category": "Gaming",
        "category_icon": "\U0001F3AE",
        "description": "From indie games to competitive FPS titles — gaming is how I unwind and connect with friends online.",
        "featured": False,
    },
    {
        "title": "Music",
        "seed": "music2024",
        "category": "Music",
        "category_icon": "\U0001F3B5",
        "description": "I play guitar and enjoy discovering new artists across genres. Music is always playing in the background when I code.",
        "featured": False,
    },
    {
        "title": "Reading",
        "seed": "reading2024",
        "category": "Learning",
        "category_icon": "\U0001F4DA",
        "description": "I read mostly non-fiction — tech, psychology, and history. Currently working through a book on systems thinking.",
        "featured": False,
    },
]


@app.route('/')
def index():
    return render_template('index.html', title="MLH Fellow", url=os.getenv("URL"))


@app.route('/work-experience')
def work_experience():
    return render_template('work_experience.html', entries=WORK_EXPERIENCE_ENTRIES)
@app.route('/map')
def map():
    return render_template('map.html', url=os.getenv("URL"))

@app.route('/hobbies')
def hobbies():
    return render_template('hobbies.html', hobbies=HOBBIES)
