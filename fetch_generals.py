import urllib.request
import urllib.parse
import json
import re
import time
import html

API_URL = "https://wiki.biligame.com/msgs/api.php"
OUTPUT_FILE = "candidates.json"

def make_request(params):
    url = API_URL
    # Encode params
    data = urllib.parse.urlencode(params).encode('utf-8')
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    retries = 3
    for i in range(retries):
        try:
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=30) as response:
                return json.loads(response.read().decode())
        except Exception as e:
            print(f"Request failed (attempt {i+1}/{retries}): {e}")
            time.sleep(1)
    return {}

def get_category_members(category_name):
    members = []
    cmcontinue = None
    while True:
        params = {
            "action": "query",
            "list": "categorymembers",
            "cmtitle": category_name,
            "cmlimit": "500",
            "format": "json"
        }
        if cmcontinue:
            params["cmcontinue"] = cmcontinue
        
        data = make_request(params)
        new_members = data.get("query", {}).get("categorymembers", [])
        members.extend(new_members)
        
        if "continue" in data:
            cmcontinue = data["continue"]["cmcontinue"]
        else:
            break
            
    return members

def get_all_skills():
    skills = {} # general_name -> list of skills
    offset = 0
    while True:
        # SMW ask query with offset
        query = f"[[Category:技能]]|?所属武将|?技能名|?经典技能描述|?技能序号|limit=500|offset={offset}"
        params = {
            "action": "ask",
            "query": query,
            "format": "json"
        }
        data = make_request(params)
        results = data.get("query", {}).get("results", {})
        
        if not results:
            break
            
        for key, info in results.items():
            printouts = info.get("printouts", {})
            general_names = printouts.get("所属武将", [])
            skill_names = printouts.get("技能名", [])
            descriptions = printouts.get("经典技能描述", [])
            orders = printouts.get("技能序号", [])
            
            if not general_names:
                continue
                
            general_name = general_names[0].get("fulltext") if isinstance(general_names[0], dict) else general_names[0]
            
            skill = {
                "name": skill_names[0] if skill_names else key,
                "description": descriptions[0] if descriptions else "",
                "order": int(orders[0]) if orders and str(orders[0]).isdigit() else 99
            }
            
            if general_name not in skills:
                skills[general_name] = []
            skills[general_name].append(skill)
            
        offset += 500
        if len(results) < 500:
            break
            
    # Sort skills by order
    for gen in skills:
        skills[gen].sort(key=lambda x: x["order"])
        
    return skills

def get_pages_content(titles):
    contents = {}
    # Fetch in batches of 20 to avoid URL length issues (though POST handles it, smaller batches are safer)
    chunk_size = 20
    for i in range(0, len(titles), chunk_size):

        chunk = titles[i:i+chunk_size]
        params = {
            "action": "query",
            "prop": "revisions",
            "titles": "|".join(chunk),
            "rvprop": "content",
            "format": "json"
        }
        data = make_request(params)
        pages = data.get("query", {}).get("pages", {})
        for page_id, page in pages.items():
            if "missing" in page:
                continue
            title = page.get("title")
            content = page.get("revisions", [])[0].get("*", "")
            contents[title] = content
        print(f"Fetched content for {len(contents)}/{len(titles)} pages...")
    return contents

def get_image_urls(filenames):
    urls = {}
    # Fetch in batches of 50
    chunk_size = 50
    filenames_list = list(filenames)
    for i in range(0, len(filenames_list), chunk_size):
        chunk = filenames_list[i:i+chunk_size]
        normalized_chunk = []
        for n in chunk:
            if n.startswith("文件:"):
                normalized_chunk.append(n.replace("文件:", "File:", 1))
            elif n.lower().startswith("file:"):
                normalized_chunk.append(n) # Assume it's already correct or will be handled
            else:
                normalized_chunk.append(f"File:{n}")
                
        params = {
            "action": "query",
            "prop": "imageinfo",
            "titles": "|".join(normalized_chunk),
            "iiprop": "url",
            "format": "json"
        }
        data = make_request(params)
        pages = data.get("query", {}).get("pages", {})
        for page_id, page in pages.items():
            title = page.get("title", "")
            # Normalize title for key: remove File: or 文件:
            key = title.replace("File:", "").replace("file:", "").replace("文件:", "")
            imageinfo = page.get("imageinfo", [])
            if imageinfo:
                # Also try to map back to original input if possible, but using normalized key is safer
                urls[key] = imageinfo[0].get("url")
        print(f"Fetched URLs for {len(urls)}/{len(filenames_list)} images...")
    return urls

def clean_html(text):
    if not text:
        return ""
    # Remove html tags
    text = re.sub(r'<[^>]+>', '', text)
    # Remove wiki markup like ''' '''
    text = text.replace("'''", "")
    text = text.replace("''", "")
    return text.strip()

def parse_general_template(content):
    # Simple parser for {{武将 ... }}
    # Find the {{武将 ... }} block
    match = re.search(r'{{武将\s*\|(.*?)\n}}', content, re.DOTALL)
    if not match:
        return {}
    
    data = {}
    params = match.group(1)
    # Split by pipe that is at start of line or preceded by newline
    # This is tricky because params can be multiline.
    # Let's try simple line splitting
    lines = params.split('\n')
    for line in lines:
        line = line.strip()
        if not line.startswith('|'):
            continue
        parts = line[1:].split('=', 1)
        if len(parts) == 2:
            key = parts[0].strip()
            val = parts[1].strip()
            data[key] = val
    return data

def search_files(name):
    params = {
        "action": "query",
        "list": "search",
        "srsearch": name,
        "srnamespace": "6", # File namespace
        "srlimit": "10",
        "format": "json"
    }
    return make_request(params).get("query", {}).get("search", [])

def fix_images():
    print("Fixing missing images...")
    try:
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            generals = json.load(f)
    except FileNotFoundError:
        print("candidates.json not found!")
        return

    missing_count = sum(1 for g in generals if not g["portrait"])
    print(f"Found {missing_count} generals with missing portraits.")
    
    updated_count = 0
    for i, g in enumerate(generals):
        if g["portrait"]:
            continue
            
        name = g["name"]
        print(f"[{i+1}/{len(generals)}] Searching image for {name}...")
        
        files = search_files(name)
        if not files:
            print(f"  No files found for {name}")
            continue
            
        # Select best match
        best_file = None
        # Priority 1: Contains "经典形象"
        for f in files:
            if "经典形象" in f["title"]:
                best_file = f["title"]
                break
        
        # Priority 2: Contains "经典"
        if not best_file:
            for f in files:
                if "经典" in f["title"]:
                    best_file = f["title"]
                    break
                    
        # Priority 3: Contains name exactly (ignoring extension)
        if not best_file:
            for f in files:
                title_no_ext = f["title"].rsplit('.', 1)[0]
                if title_no_ext.endswith(name) or title_no_ext.endswith(f":{name}"):
                     best_file = f["title"]
                     break

        # Priority 4: Just take the first one (risky but better than nothing?)
        # Maybe exclude "头像" if possible?
        if not best_file:
             for f in files:
                 if "头像" not in f["title"]:
                     best_file = f["title"]
                     break
        
        # Priority 5: Fallback to first one
        if not best_file:
            best_file = files[0]["title"]
            
        print(f"  Selected: {best_file}")
        
        # Get URL
        urls = get_image_urls([best_file])
        # Clean key for lookup
        key = best_file.replace("File:", "").replace("file:", "").replace("文件:", "")
        url = urls.get(key)
        
        if url:
            g["portrait"] = url
            updated_count += 1
        else:
            print("  Failed to get URL")
            
        # Sleep to be nice
        time.sleep(0.5)
        
        # Save periodically
        if updated_count % 10 == 0:
            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(generals, f, indent=2, ensure_ascii=False)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(generals, f, indent=2, ensure_ascii=False)
    print(f"Finished! Updated {updated_count} images.")

def main():
    # Check if candidates.json exists and has data
    import os
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if data and len(data) > 100:
                fix_images()
                return

    print("Fetching generals list...")
    members = get_category_members("Category:武将")
    general_titles = [m["title"] for m in members]
    print(f"Found {len(general_titles)} generals.")
    
    print("Fetching skills...")
    all_skills = get_all_skills()
    print(f"Found skills for {len(all_skills)} generals.")
    
    print("Fetching page contents...")
    contents = get_pages_content(general_titles)
    
    generals_data = []
    image_filenames = set()
    
    print("Processing generals...")
    for title in general_titles:
        content = contents.get(title, "")
        if not content:
            continue
            
        template_data = parse_general_template(content)
        
        # Extract basic info
        name = template_data.get("武将名", title)
        hp = template_data.get("经典体力", template_data.get("体力", "3"))
        # Handle HP format like "4" or "4/3" or "3"
        # Take the first number
        hp_match = re.search(r'\d+', hp)
        hp_val = int(hp_match.group(0)) if hp_match else 3
        
        # Find image
        # Priority 1: Exact match for Name-经典形象.png
        image_name = f"{name}-经典形象.png"
        
        # Helper to find image in content
        def find_image_in_content(pattern):
            # Case insensitive search
            match = re.search(pattern, content, re.IGNORECASE)
            return match.group(1) if match else None

        # Try to find specific image files
        candidates = [
            f"file:{name}-经典形象.png",
            f"file:{name}.png",
            f"file:{name}.jpg",
            f"file:{name}（.*?）.png" # Handle variants
        ]
        
        found_image = None
        
        # 1. Look for Name-经典形象.png explicitly
        if f"file:{image_name}" in content.lower():
            found_image = image_name
        
        # 2. Look for any file containing the name
        if not found_image:
            # Regex to find [[File: ... Name ... .png|...]]
            # This is hard because of pipe separators.
            # Let's just look for any file tag that contains the name
            # pattern: [[File:(.*?Name.*?)\|
            name_escaped = re.escape(name)
            match = re.search(r'\[\[(?:File|file):(.*?'+name_escaped+r'.*?)\|', content, re.IGNORECASE)
            if match:
                found_image = match.group(1)

        # 3. Fallback to default if nothing found
        if not found_image:
            found_image = image_name
            
        # Clean up image name (remove duplicate File: prefix if any)
        found_image = found_image.replace("File:", "").replace("file:", "").strip()
        image_filenames.add(found_image)
        
        my_skills = all_skills.get(name, [])
        skill_names = [s["name"] for s in my_skills]
        # Clean description: remove HTML and [[Link|Text]]
        skill_descs = []
        for s in my_skills:
            desc = clean_html(s['description'])
            # Remove [[Link|Text]] -> Text
            desc = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]+)\]\]', r'\1', desc)
            skill_descs.append(f"{s['name']}:{desc}")
        
        general = {
            "id": name,
            "name": name,
            "hpMax": hp_val,
            "hp": hp_val,
            "skills": skill_names,
            "portrait": found_image,
            "skills_description": skill_descs,
            "enable": True,
            "localPortrait": f"/images/generals/{name}.jpg",
            "initial_armor": 0
        }
        generals_data.append(general)
        
    print(f"Fetching URLs for {len(image_filenames)} images...")
    image_urls = get_image_urls(image_filenames)
    
    # Update image URLs
    for g in generals_data:
        img_name = g["portrait"]
        # Try exact match or with File: prefix
        url = image_urls.get(img_name) or image_urls.get(f"File:{img_name}")
        if url:
            g["portrait"] = url
        else:
            # Fallback or keep filename if not found
            g["portrait"] = "" 
            
    print(f"Saving {len(generals_data)} generals to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(generals_data, f, indent=2, ensure_ascii=False)
        
    print("Done!")

if __name__ == "__main__":
    main()
