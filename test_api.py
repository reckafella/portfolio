#!/usr/bin/env python3

"""
Simple script to test the project API endpoints
"""

import requests
import json


def test_api_endpoints():
    base_url = "http://localhost:8000/api/v1"

    print("Testing Project API Endpoints...")
    print("=" * 50)

    # Test 1: Form Configuration
    print("\n1. Testing Form Configuration Endpoint:")
    try:
        response = requests.get(f"{base_url}/projects/form-config/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Form Title: {data.get('form_title', 'N/A')}")
            print(f"Number of Fields: {len(data.get('fields', []))}")
            print("✅ Form config endpoint working!")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")

    # Test 2: Project List
    print("\n2. Testing Project List Endpoint:")
    try:
        response = requests.get(f"{base_url}/projects/list/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Total Projects: {data.get('count', 0)}")
            print("✅ Project list endpoint working!")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")

    # Test 3: Project ViewSet
    print("\n3. Testing Project ViewSet Endpoint:")
    try:
        response = requests.get(f"{base_url}/projects/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and 'results' in data:
                print(f"Total Projects (ViewSet): {data.get('count', 0)}")
            else:
                print(f"Projects (ViewSet): {len(data) if isinstance(data, list) else 'Unknown'}")
            print("✅ Project ViewSet endpoint working!")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")


if __name__ == "__main__":
    test_api_endpoints()
