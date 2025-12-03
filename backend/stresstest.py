import requests
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"

# Correct URLs for your API
SIGNUP_URL = f"{BASE_URL}/api/users/signup/"
LOGIN_URL = f"{BASE_URL}/api/users/login/"
CREATE_EVENT_URL = f"{BASE_URL}/api/events/create/"
MY_EVENTS_URL = f"{BASE_URL}/api/events/my-events/"

NUM_USERS = 1000
EVENTS_PER_USER = 20

# Store tokens for logged-in users
tokens = {}

# Create users
for i in range(1, NUM_USERS + 1):
    username = f"user{i}_{int(datetime.now().timestamp())}"
    password = "Password123"
    data = {"username": username, "password": password}
    
    response = requests.post(SIGNUP_URL, json=data)
    print(f"Signup {username}: {response.status_code}")
    
    if response.status_code == 201 or response.status_code == 200:
        # Login immediately to get token
        login_resp = requests.post(LOGIN_URL, json=data)
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            tokens[username] = token
        else:
            print(f"Login failed for {username}: {login_resp.status_code}")
    else:
        print(f"Signup failed for {username}: {response.text}")

# Create events for each user
for username, token in tokens.items():
    headers = {"Authorization": f"Token {token}"}
    
    for j in range(1, EVENTS_PER_USER + 1):
        start_time = datetime.now() + timedelta(minutes=j*10)
        event_data = {
            "title": f"Event {j} for {username}",
            "description": f"This is a test event number {j} for {username}.",
            "start_time": start_time.isoformat(),
            "end_time": (start_time + timedelta(hours=1)).isoformat()
        }
        resp = requests.post(CREATE_EVENT_URL, json=event_data, headers=headers)
        print(f"Create event {username} [{j}]: {resp.status_code}")

# Fetch events to confirm
for username, token in tokens.items():
    headers = {"Authorization": f"Token {token}"}
    resp = requests.get(MY_EVENTS_URL, headers=headers)
    if resp.status_code == 200:
        events = resp.json()
        print(f"Fetched {len(events)} events for {username}")
    else:
        print(f"Failed to fetch events for {username}: {resp.status_code}")

print("====== STRESS TEST COMPLETE ======")
