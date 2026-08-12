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
        "Authorization": f"Bearer {key}",
        "Range": "0-0"
    }
    
    # Check tenants
    r_tenants = requests.get(f"{url}/rest/v1/tenants?select=id", headers=headers)
    # Check whatsapp_integrations
    r_wa = requests.get(f"{url}/rest/v1/whatsapp_integrations?select=id", headers=headers)
    
    print(f"Tenants status: {r_tenants.status_code}")
    print(f"Tenants content: {r_tenants.text}")
    print(f"WhatsApp Integrations status: {r_wa.status_code}")
    print(f"WhatsApp Integrations content: {r_wa.text}")

if __name__ == "__main__":
    check()
