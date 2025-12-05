import requests
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"
SIGNUP_URL = f"{BASE_URL}/api/users/signup/"
LOGIN_URL = f"{BASE_URL}/api/users/login/"
CREATE_EVENT_URL = f"{BASE_URL}/api/events/create/"
APPROVE_EVENT_URL = f"{BASE_URL}/api/events/approve/"  # append event ID later
MY_EVENTS_URL = f"{BASE_URL}/api/events/my-events/"

# Define test users with roles
users = [
    {"username": "aa_user1", "email": "aa1@example.com", "password": "Password123", "role": "AA"},
    {"username": "aa_user2", "email": "aa2@example.com", "password": "Password123", "role": "AA"},
    {"username": "daa_user1", "email": "daa1@example.com", "password": "Password123", "role": "DAA"},
    {"username": "normal_user1", "email": "user1@example.com", "password": "Password123", "role": "USER"},
]

tokens = {}
created_events = []

# Signup + Login
for u in users:
    resp = requests.post(SIGNUP_URL, json=u)
    print(f"Signup {u['username']}: {resp.status_code}")

    if resp.status_code in (200, 201):
        login_resp = requests.post(LOGIN_URL, json={"username": u["username"], "password": u["password"]})
        if login_resp.status_code == 200:
            token = login_resp.json().get("access")
            tokens[u["username"]] = {"token": token, "role": u["role"]}
        else:
            print(f"Login failed for {u['username']}: {login_resp.status_code}")

# AA users create events (assign to normal_user1)
normal_user_id = None
for username, info in tokens.items():
    if info["role"] == "USER":
        normal_user_id = username

for username, info in tokens.items():
    if info["role"] == "AA":
        headers = {"Authorization": f"Bearer {info['token']}"}
        # Create at different times to avoid overlap
        if username == "aa_user1":
            start_time = datetime.now() + timedelta(hours=2)
        else:
            start_time = datetime.now() + timedelta(hours=4)
        event_data = {
            "title": f"Event by {username}",
            "description": f"Created by {username} - Approved by DAA",
            "start_time": start_time.isoformat(),
            "end_time": (start_time + timedelta(hours=1)).isoformat()
        }
        resp = requests.post(CREATE_EVENT_URL, json=event_data, headers=headers)
        print(f"Create event {username}: {resp.status_code}")
        if resp.status_code == 201:
            created_events.append(resp.json()["id"])

# DAA approves events
for username, info in tokens.items():
    if info["role"] == "DAA":
        headers = {"Authorization": f"Bearer {info['token']}"}
        for event_id in created_events:
            resp = requests.patch(f"{APPROVE_EVENT_URL}{event_id}/", json={"action": "approve"}, headers=headers)
            print(f"Approve event {event_id} by {username}: {resp.status_code} -> {resp.text}")

# Normal users fetch events
for username, info in tokens.items():
    if info["role"] == "USER":
        headers = {"Authorization": f"Bearer {info['token']}"}
        resp = requests.get(MY_EVENTS_URL, headers=headers)
        print(f"Fetch events {username}: {resp.status_code}")

# AA users also check their events (which should be approved now)
aa_events_url = f"{BASE_URL}/api/events/my-events/"
for username, info in tokens.items():
    if info["role"] == "AA":
        headers = {"Authorization": f"Bearer {info['token']}"}
        resp = requests.get(aa_events_url, headers=headers)
        print(f"Fetch events {username}: {resp.status_code} -> {resp.text}")

print("====== STRESS TEST COMPLETE ======")