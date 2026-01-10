#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Current working directory: $(pwd)"
ls -la
cat requirements.txt

pip install --upgrade pip
pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
