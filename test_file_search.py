import urllib.request
import urllib.parse
import json

API_URL = "https://wiki.biligame.com/msgs/api.php"

def make_request(params):
    url = API_URL
    data = urllib.parse.urlencode(params).encode('utf-8')
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    try:
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Request failed: {e}")
        return {}

def search_files(name):
    params = {
        "action": "query",
        "list": "search",
        "srsearch": name,
        "srnamespace": "6", # File namespace
        "srlimit": "5",
        "format": "json"
    }
    return make_request(params).get("query", {}).get("search", [])

def main():
    name = "鲍三娘"
    files = search_files(name)
    print(f"Files for {name}:")
    for f in files:
        print(f['title'])
        
    name = "白无常"
    files = search_files(name)
    print(f"Files for {name}:")
    for f in files:
        print(f['title'])


if __name__ == "__main__":
    main()
