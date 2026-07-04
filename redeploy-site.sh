#!/bin/bash

tmux kill-server 2>/dev/null

cd /root/portfolioSite

git fetch
git reset origin/main --hard

if [ ! -d "python3-virtualenv" ]; then
    python3 -m venv python3-virtualenv
fi

source python3-virtualenv/bin/activate
pip install -r requirements.txt

if [ ! -f ".env" ]; then
    cp example.env .env
fi

tmux new-session -d -s 0 "cd /root/portfolioSite && source python3-virtualenv/bin/activate && export FLASK_ENV=development && flask run --host=0.0.0.0"

echo "Redeploy complete. Site should be running."
