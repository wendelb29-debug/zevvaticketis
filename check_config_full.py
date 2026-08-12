import os
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
    
    tables = [
        "tenants", 
        "tenant_members", 
        "whatsapp_integrations", 
        "whatsapp_instances",
        "platform_admins",
        "events",
        "ticket_types"
    ]
    
    for table in tables:
        try:
            r = requests.get(f"{url}/rest/v1/{table}?select=count", headers={**headers, "Prefer": "count=exact"})
            count = r.headers.get("Content-Range", "0-0/0").split("/")[-1]
            print(f"Table {table}: {count} records (Status: {r.status_code})")
        except Exception as e:
            print(f"Table {table}: Error {str(e)}")

if __name__ == "__main__":
    check()
