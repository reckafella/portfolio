#!/usr/bin/env python3
"""
Test script to check static file conflicts
"""
import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
project_dir = Path(__file__).parent
sys.path.insert(0, str(project_dir))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio.settings')
django.setup()

from django.contrib.staticfiles.finders import get_finders
from django.contrib.staticfiles.storage import staticfiles_storage


def test_static_files():
    print("Testing static file collection...")

    # Get all static file finders
    finders = get_finders()

    # Collect all static files
    all_files = {}
    conflicts = []

    for finder in finders:
        for path, storage in finder.list([]):
            if path in all_files:
                conflicts.append((path, all_files[path], storage))
            else:
                all_files[path] = storage

    if conflicts:
        print(f"❌ Found {len(conflicts)} conflicts:")
        for path, storage1, storage2 in conflicts:
            print(f"  - {path}")
            print(f"    From: {storage1}")
            print(f"    From: {storage2}")
    else:
        print("✅ No static file conflicts found!")
        print(f"Total static files: {len(all_files)}")

    return len(conflicts) == 0


if __name__ == "__main__":
    success = test_static_files()
    sys.exit(0 if success else 1)
