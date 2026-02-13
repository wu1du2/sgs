import urllib.request
import urllib.parse
import json

API_URL = "https://wiki.biligame.com/msgs/api.php"

def get_page_content(title):
    params = {
        "action": "query",
        "prop": "revisions",
        "titles": title,
        "rvprop": "content",
        "format": "json"
    }
    url = f"{API_URL}?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            pages = data.get("query", {}).get("pages", {})
            for page_id in pages:
                return pages[page_id].get("revisions", [])[0].get("*", "")
    except Exception as e:
        print(f"Error fetching {title}: {e}")
        return ""

def ask_query(query_string):
    params = {
        "action": "ask",
        "query": query_string,
        "format": "json"
    }
    url = f"{API_URL}?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            return data.get("query", {}).get("results", {})
    except Exception as e:
        print(f"Error executing ask query: {e}")
        return {}

def main():
    # Try to find skills for 势太史慈
    # Note: Property names might need to be verified. 
    # Based on the template, "所属武将" is likely a property.
    query = "[[Category:技能]][[所属武将::势太史慈]]|?技能名|?经典技能描述|?技能序号"
    print(f"Querying: {query}")
    results = ask_query(query)
    print(json.dumps(results, indent=2, ensure_ascii=False))







if __name__ == "__main__":
    main()
