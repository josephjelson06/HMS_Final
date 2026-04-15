import urllib.request
import json

try:
    with urllib.request.urlopen("http://localhost:8000/api/subscriptions") as response:
        body = response.read().decode("utf-8")
        print(json.dumps(json.loads(body), indent=2))
except Exception as e:
    print(f"Error: {e}")
