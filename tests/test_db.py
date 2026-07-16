import unittest
from peewee import *
import sys
import os

# Setting testing environment BEFORE importing app
os.environ['TESTING'] = 'true'

# Adding the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import TimelinePost

MODELS = [TimelinePost]

test_db = SqliteDatabase(':memory:')

class TestTimelinePost(unittest.TestCase):

    def setUp(self):
        test_db.bind(MODELS, bind_refs=False, bind_backrefs=False)
        test_db.connect()
        test_db.create_tables(MODELS)

        # Replacing the database for TimelinePost with test db
        self.original_db = TimelinePost._meta.database
        TimelinePost._meta.database = test_db

    def tearDown(self):
        # Restoring original database
        TimelinePost._meta.database = self.original_db
        test_db.drop_tables(MODELS)
        test_db.close()

    def test_timeline_post(self):
        first_post = TimelinePost.create(
            name='John Doe',
            email='john@example.com',
            content='Hello world, I\'m John!'
        )
        assert first_post.id == 1

        second_post = TimelinePost.create(
            name='Jane Doe',
            email='jane@example.com',
            content='Hello world, I\'m Jane!'
        )
        assert second_post.id == 2

        posts = list(TimelinePost.select().order_by(TimelinePost.created_at.desc()))

        assert len(posts) == 2
        assert posts[0].name == 'Jane Doe'
        assert posts[0].email == 'jane@example.com'
        assert posts[0].content == "Hello world, I'm Jane!"
        assert posts[1].name == 'John Doe'
        assert posts[1].email == 'john@example.com'
        assert posts[1].content == "Hello world, I'm John!"