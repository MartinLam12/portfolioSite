import os
from flask import Flask, render_template, request
from dotenv import load_dotenv

from app.education import education_bp
from app.hobbies import hobbies_bp

load_dotenv()
app = Flask(__name__)
app.register_blueprint(education_bp)
app.register_blueprint(hobbies_bp)


@app.route('/')
def index():
    return render_template('index.html', title="MLH Fellow", url=os.getenv("URL"))
