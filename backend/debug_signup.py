import requests
import json

data = {
    "username": "debuguser",
    "email": "debug@example.com",
    "password": "Password123",
    "role": "AA"
}

resp = requests.post('http://127.0.0.1:8000/api/users/signup/', json=data)
print(f"Status: {resp.status_code}")
print(f"Response: {resp.text}")
if resp.status_code == 400:
    try:
        print(f"JSON Error: {json.dumps(resp.json(), indent=2)}")
    except:
        pass
