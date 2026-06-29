import os
from flask import Flask, render_template, request
from dotenv import load_dotenv

from app.education import education_bp

load_dotenv()
app = Flask(__name__)
app.register_blueprint(education_bp)

WORK_EXPERIENCE_ENTRIES = [
    {
        "role": "Strategic Courses Researcher",
        "company": "North Seattle College",
        "dates": "Jul 2025 – Present",
        "location": "Seattle, WA",
        "icon": "🔬",
        "bullets": [
            "Conducted quantitative and qualitative data analysis to evaluate student success in courses.",
            "Built an offline audio transcription pipeline using Python and OpenAI Whisper to transcribe sensitive audio data.",
            "Presented findings (lack of canvas/technology support, group work, etc) to faculty stakeholders.",
        ],
        "tags": ["Python", "OpenAI Whisper", "Data Analysis", "Qualitative Coding"],
    },
    {
        "role": "Open Source Contributor",
        "company": "CodeDay Labs",
        "dates": "Mar 2026 – Apr 2026",
        "location": "Remote",
        "icon": "🌐",
        "bullets": [
            "Contributed a server-side syntax highlighting plugin to Foundry, an open-source Go CMS (186+ GitHub stars), adding colorized code rendering for 9 languages with zero runtime JS dependencies.",
            "Built the full plugin end-to-end in Go including rendering engine, asset injection, plugin registration, and unit tests.",
        ],
        "tags": ["Go", "Open Source", "Plugin Development"],
    },
    {
        "role": "Software Engineering Intern",
        "company": "Funvite (Startup)",
        "dates": "Jul 2025 – Jan 2026",
        "location": "Remote",
        "icon": "💻",
        "bullets": [
            "Contributed to a React Native mobile app with 3,000+ downloads using Expo, Firebase, and JavaScript.",
            "Led UI rebranding: renamed components, applied new brand colors, replaced icons, splash screens, and logos.",
            "Implemented time-sensitive feature toggles that automatically adjust app functionality based on event lifecycles.",
        ],
        "tags": ["React Native", "Firebase", "Expo", "JavaScript"],
    },
    {
        "role": "Computer Science Tutor",
        "company": "Code Ninjas",
        "dates": "Nov 2022 – Oct 2025",
        "location": "Seattle, WA",
        "icon": "🎓",
        "bullets": [
            "Taught programming to 7–15 students per class (ages 7–14) in JavaScript and MakeCode (block coding).",
            "Mentored 100+ students total, guiding them through algorithms, debugging, and game-building projects.",
        ],
        "tags": ["JavaScript", "MakeCode", "Teaching"],
    },
    {
        "role": "Undergraduate Researcher – Environmental Data Analysis",
        "company": "North Seattle College",
        "dates": "Sep 2024 – Dec 2024",
        "location": "Seattle, WA",
        "icon": "📊",
        "bullets": [
            "Analyzed 1,000+ PM2.5 air quality measurements across Seattle colleges to determine if historically redlined colleges were exposed to higher PM2.5 levels.",
            "Applied Python (NumPy, Pandas, Matplotlib, Seaborn) for data cleaning, statistical analysis, and visualization.",
        ],
        "tags": ["Python", "NumPy", "Pandas", "Matplotlib", "Data Analysis"],
    },
]

PROJECTS = [
    {
        "title": "ReplyPilot",
        "subtitle": "AI Emailing Agent",
        "date": "Apr 2026",
        "description": "Built a full-stack AI Email Agent adopted by a local boxing gym. Features Gmail integration, AI-drafted replies with vector-based style learning (pgvector), and Stripe payments. Deployed to production on Vercel.",
        "tags": ["Next.js", "TypeScript", "Supabase", "Google Gemini", "Stripe", "pgvector"],
        "featured": True,
    },
]

# ── Routes ───────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html', title="Martin Lam", url=os.getenv("URL"))


@app.route('/work-experience')
def work_experience():
    return render_template('work_experience.html', entries=WORK_EXPERIENCE_ENTRIES)

@app.route('/map')
def map():
    return render_template('map.html', url=os.getenv("URL"))

@app.route('/projects')
def projects():
    return render_template('hobbies.html', projects=PROJECTS)
