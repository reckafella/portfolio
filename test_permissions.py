#!/usr/bin/env python3

"""
Test script to verify project API permissions
"""

import requests
import json

def test_permission_system():
    base_url = "http://localhost:8000/api/v1"
    
    print("Testing Project API Permissions...")
    print("=" * 50)
    
    # Test 1: Anonymous access to list (should work)
    print("\n1. Testing anonymous access to project list:")
    try:
        response = requests.get(f"{base_url}/projects/list/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Anonymous users can view projects: {data.get('count', 0)} projects found")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")
    
    # Test 2: Anonymous access to create (should fail)
    print("\n2. Testing anonymous access to create project:")
    try:
        test_project = {
            "title": "Test Project",
            "description": "This should fail",
            "project_type": "web",
            "category": "test",
            "live": True
        }
        response = requests.post(f"{base_url}/projects/create/", 
                               json=test_project,
                               headers={'Content-Type': 'application/json'})
        print(f"Status Code: {response.status_code}")
        if response.status_code == 401:
            print("✅ Anonymous users correctly blocked from creating projects")
        elif response.status_code == 403:
            print("✅ Anonymous users correctly forbidden from creating projects")
        else:
            print(f"❌ Unexpected response: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")
    
    # Test 3: Form config access (should work)
    print("\n3. Testing form config access:")
    try:
        response = requests.get(f"{base_url}/projects/form-config/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Form config accessible: '{data.get('form_title', 'Unknown')}' form")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")

if __name__ == "__main__":
    test_permission_system()
