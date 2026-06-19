from flask import Blueprint, render_template

education_bp = Blueprint('education', __name__)

EDUCATION_ENTRIES = [
    {
        "school": "University of Lorem",
        "degree": "Bachelor of Science in Ipsum Studies",
        "dates": "Aug 2019 - May 2023",
        "description": (
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod "
            "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim "
            "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea "
            "commodo consequat."
        ),
    },
    {
        "school": "Dolor County High School",
        "degree": "High School Diploma",
        "dates": "Aug 2015 - May 2019",
        "description": (
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum "
            "dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non "
            "proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        ),
    },
]


@education_bp.route('/education')
def education():
    return render_template('education.html', title="Education", entries=EDUCATION_ENTRIES)
