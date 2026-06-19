import os
from flask import Flask, render_template, request
from dotenv import load_dotenv

from app.education import education_bp

load_dotenv()
app = Flask(__name__)
app.register_blueprint(education_bp)


@app.route('/')
def index():
    return render_template('index.html', title="MLH Fellow", url=os.getenv("URL"))


@app.route('/map')
def map():
    return render_template('map.html', url=os.getenv("URL"))

@app.route('/hobbies')
def hobbies():
    return render_template('hobbies.html')
