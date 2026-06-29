from flask import Blueprint, render_template

education_bp = Blueprint('education', __name__)

EDUCATION_ENTRIES = [
    {
        "school": "North Seattle College",
        "degree": "B.S. Computer Science, Data Science",
        "dates": "Expected Spring 2027",
        "description": (
            "Studying Computer Science and Data Science with a focus on software engineering, "
            "data analysis, and algorithms. Active in undergraduate research, exploring topics "
            "from environmental data analysis to course success metrics."
        ),
    },
]


@education_bp.route('/education')
def education():
    return render_template('education.html', title="Education", entries=EDUCATION_ENTRIES)
