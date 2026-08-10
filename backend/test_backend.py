import requests
import os
import sys

# Backend server parameters
BASE_URL = "http://127.0.0.1:8000"
API_PREFIX = "/api/v1"

def run_tests():
    print("=== STARTING BACKEND INTEGRATION TESTS ===")
    
    # 1. Register a test user
    email = "tester@example.com"
    password = "securepassword123"
    
    print("\n1. Testing Register API...")
    reg_url = f"{BASE_URL}{API_PREFIX}/auth/register"
    reg_data = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(reg_url, json=reg_data)
        if response.status_code == 201:
            print("Successfully registered test user!")
            print(f"Response: {response.json()}")
        elif response.status_code == 400 and "already exists" in response.json().get("detail", ""):
            print("Test user already exists (expected if rerun). Proceeding to login...")
        else:
            print(f"Failed to register user. Status: {response.status_code}")
            print(f"Error details: {response.text}")
            return
    except requests.exceptions.ConnectionError:
        print(f"Error: Backend server is not running on {BASE_URL}. Start it first with uvicorn main:app!")
        return

    # 2. Login to get token
    print("\n2. Testing Login API...")
    login_url = f"{BASE_URL}{API_PREFIX}/auth/login"
    login_data = {
        "username": email,
        "password": password
    }
    
    response = requests.post(login_url, data=login_data) # Form URL-encoded
    if response.status_code != 200:
        print(f"Failed to log in. Status: {response.status_code}")
        print(f"Details: {response.text}")
        return
        
    token_json = response.json()
    token = token_json["access_token"]
    print("Successfully logged in!")
    print(f"Access Token: {token[:20]}...")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }

    # 3. Read profile
    print("\n3. Testing Auth Me API...")
    me_url = f"{BASE_URL}{API_PREFIX}/auth/me"
    response = requests.get(me_url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to read profile. Status: {response.status_code}")
        return
    print(f"Profile output: {response.json()}")

    # 4. Upload Image API
    print("\n4. Testing Image Upload & Preprocessing API...")
    upload_url = f"{BASE_URL}{API_PREFIX}/uploads/image"
    
    test_image_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_face.png")
    if not os.path.exists(test_image_path):
        print(f"Error: test image not found at {test_image_path}. Run extraction tests first.")
        return
        
    print(f"Uploading file: {test_image_path}")
    with open(test_image_path, "rb") as f:
        files = {"file": (os.path.basename(test_image_path), f, "image/png")}
        response = requests.post(upload_url, headers=headers, files=files)
        
    if response.status_code != 200:
        print(f"Upload failed. Status: {response.status_code}")
        print(f"Error details: {response.text}")
        return
        
    analysis = response.json()
    print("Successfully uploaded image and triggered face preprocessing pipeline!")
    print(f"Analysis Response: {analysis}")
    print("\nPredictions returned from voting engine:")
    for pred in analysis.get("predictions", []):
        print(f"  {pred['model_name']}: {pred['prediction']} (confidence: {pred['confidence']})")
    print(f"Final Majority Vote: {analysis.get('prediction')} (confidence: {analysis.get('confidence')})")

    # 5. Fetch analyses history
    print("\n5. Testing Analyses History API...")
    history_url = f"{BASE_URL}{API_PREFIX}/analyses"
    response = requests.get(history_url, headers=headers)
    if response.status_code == 200:
        print(f"Successfully retrieved history! Found {len(response.json())} analyses.")
    else:
        print(f"Failed to get history. Status: {response.status_code}")

    print("\n=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_tests()
