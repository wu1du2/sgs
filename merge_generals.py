import json

# List of generals to add/update with enable=false
target_generals = [
    "鲍信", "曹髦", "崔琰", "杜预", "高览", "郝昭", "黄盖", "黄月英", "界蔡文姬", "李傕", 
    "谋黄盖", "谋黄忠", "谋马超", "谋诸葛亮", "秦宓", "SP赵云", "神郭嘉", "神孙策", 
    "神太史慈", "神周瑜", "司马昭", "徐荣"
]

def main():
    try:
        # Load candidates
        with open('candidates.json', 'r', encoding='utf-8') as f:
            candidates = json.load(f)
        
        # Load existing generals
        with open('configs/generals.json', 'r', encoding='utf-8') as f:
            generals = json.load(f)
            
        # Create a dictionary of existing generals for easy lookup
        existing_generals_map = {g['name']: g for g in generals}
        
        updated_count = 0
        added_count = 0
        
        for name in target_generals:
            # Find in candidates
            candidate = next((c for c in candidates if c['name'] == name), None)
            
            if not candidate:
                print(f"Warning: General '{name}' not found in candidates.json")
                continue
                
            # Prepare the general data
            # We need to make sure we keep the ID consistent if it exists, or use name as ID
            general_data = candidate.copy()
            general_data['enable'] = False
            
            if name in existing_generals_map:
                # Update existing
                existing_general = existing_generals_map[name]
                # Preserve some fields if needed, but here we overwrite with candidate data + enable=false
                # We should probably keep the original ID if it was different, but usually ID=Name
                # Let's just update the list in place
                index = generals.index(existing_general)
                generals[index] = general_data
                updated_count += 1
                print(f"Updated: {name}")
            else:
                # Add new
                generals.append(general_data)
                added_count += 1
                print(f"Added: {name}")
                
        # Save back to generals.json
        with open('configs/generals.json', 'w', encoding='utf-8') as f:
            json.dump(generals, f, indent=2, ensure_ascii=False)
            
        print(f"\nSummary: Updated {updated_count}, Added {added_count} generals.")
        
    except FileNotFoundError as e:
        print(f"Error: File not found - {e}")
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format - {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
