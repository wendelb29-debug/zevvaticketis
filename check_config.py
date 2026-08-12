import os
import json
import requests

def check():
    url = os.environ.get("VITE_SUPABASE_URL")
    key = os.environ.get("VITE_SUPABASE_ANON_KEY")
    
    if not url or not key:
        print("MISSING_ENV_VARS")
        return

    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}"
    }
    
    # Check platform_admins
    r_admins = requests.get(f"{url}/rest/v1/platform_admins", headers=headers)
    print(f"Platform Admins status: {r_admins.status_code}")
    print(f"Platform Admins content: {r_admins.text}")

if __name__ == "__main__":
    check()
