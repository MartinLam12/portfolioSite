from flask import Blueprint, render_template

hobbies_bp = Blueprint('hobbies', __name__)

HOBBIES = [
    {
        "name": "Photography",
        "image": "https://picsum.photos/seed/photography/600/400",
        "description": (
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod "
            "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim "
            "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea "
            "commodo consequat."
        ),
    },
    {
        "name": "Hiking",
        "image": "https://picsum.photos/seed/hiking/600/400",
        "description": (
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum "
            "dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non "
            "proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        ),
    },
    {
        "name": "Cooking",
        "image": "https://picsum.photos/seed/cooking/600/400",
        "description": (
            "Sed ut perspiciatis unde omnis iste natus error sit voluptatem "
            "accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae "
            "ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt."
        ),
    },
    {
        "name": "Playing Guitar",
        "image": "https://picsum.photos/seed/guitar/600/400",
        "description": (
            "At vero eos et accusamus et iusto odio dignissimos ducimus qui "
            "blanditiis praesentium voluptatum deleniti atque corrupti quos dolores "
            "et quas molestias excepturi sint occaecati cupiditate non provident."
        ),
    },
]


@hobbies_bp.route('/hobbies')
def hobbies():
    return render_template('hobbies.html', title="Hobbies", hobbies=HOBBIES)
