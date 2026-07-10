#!/bin/bash

BASE_URL="http://localhost:5000/api/timeline_post"
RAND=$RANDOM

NAME="TestUser$RAND"
EMAIL="test$RAND@example.com"
CONTENT="Automated test post #$RAND"

echo "Creating timeline post..."
RESPONSE=$(curl -s --request POST "$BASE_URL" \
  -d "name=$NAME&email=$EMAIL&content=$CONTENT")

echo "POST response: $RESPONSE"

POST_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

if [ -z "$POST_ID" ]; then
  echo "FAILED: could not create post"
  exit 1
fi

echo "Created post with id $POST_ID"

echo "Checking GET endpoint..."
GET_RESPONSE=$(curl -s "$BASE_URL")

if echo "$GET_RESPONSE" | grep -q "$CONTENT"; then
  echo "SUCCESS: new post found in GET response"
else
  echo "FAILED: new post not found in GET response"
  exit 1
fi

echo "Deleting test post $POST_ID..."
DELETE_RESPONSE=$(curl -s --request DELETE "$BASE_URL/$POST_ID")
echo "DELETE response: $DELETE_RESPONSE"

echo "Done."