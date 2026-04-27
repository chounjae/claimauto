#!/usr/bin/env python3
import json
from collections import Counter
import sys

file_path = r"C:\Users\blues\.claude\homunculus\projects\02a552301bb4\.observer-tmp\ecc-observer-analysis.f9RRDm.jsonl"

tools = Counter()
files = Counter()
skills_used = []

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip():
                continue
            try:
                obj = json.loads(line)
                tool = obj.get('tool', 'unknown')
                tools[tool] += 1

                output = obj.get('output', '{}')
                if isinstance(output, str):
                    try:
                        output_obj = json.loads(output)
                        filepath = output_obj.get('filePath', '')
                        if filepath:
                            filename = filepath.split('\\')[-1]
                            files[filename] += 1
                    except:
                        pass

            except json.JSONDecodeError:
                pass

    print("=== TOOL USAGE ===")
    for tool, count in tools.most_common():
        print(f"{tool}: {count}")

    print("\n=== FILES MODIFIED ===")
    for file, count in files.most_common(20):
        if file:
            print(f"{file}: {count}")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
