#!/bin/bash
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
systemctl restart myportfolio
echo "Redeploy complete. Site should be running."
