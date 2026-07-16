
import unittest
from peewee import *
import os
import json

os.environ['TESTING'] = 'true'

from app import app

class AppTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_home(self):
        response = self.client.get("/")
        assert response.status_code == 200
        html = response.get_data(as_text=True)

        # Test that the page loads successfully
        assert "MLH Fellow" in html or "Martin Lam" in html or "Portfolio" in html

        # Test that the navigation links are present
        assert "About" in html or "/about" in html

        # Test that the page contains a profile image or picture
        assert "img" in html.lower() or "profile" in html.lower() or "avatar" in html.lower()

        # Test that the page contains a hero or main section
        assert "hero" in html.lower() or "main" in html.lower()

    def test_timeline(self):
        # Test GET /api/timeline_post returns empty list initially
        response = self.client.get("/api/timeline_post")
        assert response.status_code == 200
        assert response.is_json
        json_data = response.get_json()
        assert "timeline_posts" in json_data
        assert len(json_data["timeline_posts"]) == 0

        # Test POST /api/timeline_post creates a new post
        post_response = self.client.post("/api/timeline_post", data={
            'name': 'Test User',
            'email': 'test@example.com',
            'content': 'This is a test post'
        })
        assert post_response.status_code == 200
        post_data = post_response.get_json()
        assert post_data['name'] == 'Test User'
        assert post_data['email'] == 'test@example.com'
        assert post_data['content'] == 'This is a test post'

        # Test GET /api/timeline_post returns the created post
        get_response = self.client.get("/api/timeline_post")
        get_data = get_response.get_json()
        assert len(get_data["timeline_posts"]) == 1
        assert get_data["timeline_posts"][0]['name'] == 'Test User'


        # Test that the timeline page loads
        timeline_response = self.client.get("/timeline")
        assert timeline_response.status_code == 200
        html = timeline_response.get_data(as_text=True)
        assert "<title>Timeline</title>" in html or "Timeline" in html


    def test_malformed_timeline_post(self):
        # POST request missing name
        response = self.client.post("/api/timeline_post", data={
            "email": "john@example.com",
            "content": "Hello world, I'm John!"
        })
        assert response.status_code == 400
        html = response.get_data(as_text=True)
        assert "Invalid name" in html

        # POST request with empty content
        response = self.client.post("/api/timeline_post", data={
            "name": "John Doe",
            "email": "john@example.com",
            "content": ""
        })
        assert response.status_code == 400
        html = response.get_data(as_text=True)
        assert "Invalid content" in html

        # POST request with malformed email
        response = self.client.post("/api/timeline_post", data={
            "name": "John Doe",
            "email": "not-an-email",
            "content": "Hello world, I'm John!"
        })
        assert response.status_code == 400
        html = response.get_data(as_text=True)
        assert "Invalid email" in html