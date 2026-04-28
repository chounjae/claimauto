#!/usr/bin/env python3
import json
from collections import Counter
import re

file_path = r"C:\Users\blues\.claude\homunculus\projects\02a552301bb4\.observer-tmp\ecc-observer-analysis.f9RRDm.jsonl"

edit_patterns = Counter()
write_patterns = Counter()
skill_patterns = Counter()
all_file_paths = []

with open(file_path, 'r', encoding='utf-8') as f:
    for line in f:
        if not line.strip():
            continue
        try:
            obj = json.loads(line)
            tool = obj.get('tool', '')
            output = obj.get('output', '{}')

            if isinstance(output, str):
                try:
                    output_obj = json.loads(output)
                    filepath = output_obj.get('filePath', '')
                    if filepath and '\\' in filepath:
                        all_file_paths.append(filepath)
                        # Count by tool and path
                        if tool == 'Edit':
                            # Extract path structure
                            parts = filepath.split('\\')
                            relevant_path = '/'.join(parts[-3:]) if len(parts) >= 3 else filepath
                            edit_patterns[relevant_path] += 1
                        elif tool == 'Write':
                            parts = filepath.split('\\')
                            relevant_path = '/'.join(parts[-3:]) if len(parts) >= 3 else filepath
                            write_patterns[relevant_path] += 1

                    # Check for skill-related patterns
                    if 'skill' in filepath.lower() or 'SKILL' in filepath:
                        skill_patterns[filepath] += 1

                except:
                    pass
        except json.JSONDecodeError:
            pass

print("=== EDIT PATTERNS ===")
for path, count in edit_patterns.most_common(15):
    print(f"{path}: {count}")

print("\n=== WRITE PATTERNS ===")
for path, count in write_patterns.most_common(15):
    print(f"{path}: {count}")

print("\n=== SKILL FILES ===")
for path, count in skill_patterns.most_common(15):
    print(f"{path}: {count}")

print("\n=== ALL FILE PATHS (UNIQUE) ===")
unique_paths = set()
for path in all_file_paths:
    parts = path.split('\\')
    # Extract the meaningful part
    if len(parts) > 3:
        relevant = '.../' + '/'.join(parts[-3:])
    else:
        relevant = path
    unique_paths.add(relevant)

for p in sorted(unique_paths):
    print(p)
