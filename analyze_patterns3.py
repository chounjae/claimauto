#!/usr/bin/env python3
import json
from collections import Counter
import re

file_path = r"C:\Users\blues\.claude\homunculus\projects\02a552301bb4\.observer-tmp\ecc-observer-analysis.f9RRDm.jsonl"

sessions = {}
patterns = Counter()
file_edits = Counter()

with open(file_path, 'r', encoding='utf-8') as f:
    for line_num, line in enumerate(f, 1):
        if not line.strip():
            continue
        try:
            obj = json.loads(line)
            session = obj.get('session', 'unknown')
            tool = obj.get('tool', '')
            event = obj.get('event', '')
            output = obj.get('output', '{}')

            if session not in sessions:
                sessions[session] = {'tools': [], 'files': []}

            sessions[session]['tools'].append(tool)

            if isinstance(output, str) and output != '{}':
                try:
                    output_obj = json.loads(output)
                    filepath = output_obj.get('filePath', '')

                    if filepath:
                        sessions[session]['files'].append(filepath)
                        file_edits[filepath] += 1

                        # Track pattern: old_string (what was replaced)
                        if 'oldString' in output_obj:
                            old_str = output_obj['oldString']
                            # Extract pattern from old string
                            if old_str:
                                # Look for common patterns
                                if 'name:' in old_str or 'description:' in old_str:
                                    patterns['metadata_update'] += 1
                                if 'import' in old_str:
                                    patterns['import_update'] += 1
                                if 'function' in old_str or 'const' in old_str:
                                    patterns['code_change'] += 1

                except Exception as e:
                    pass

        except json.JSONDecodeError:
            pass

print("=== SESSION ACTIVITY ===")
for session, data in sorted(sessions.items()):
    tool_counts = Counter(data['tools'])
    print(f"\nSession: {session[:8]}...")
    print(f"  Tools: {dict(tool_counts.most_common())}")
    print(f"  Files modified: {len(set(data['files']))}")

print("\n=== FILE EDIT FREQUENCY ===")
for filepath, count in file_edits.most_common(20):
    print(f"{filepath}: {count}")

print("\n=== PATTERN FREQUENCY ===")
for pattern, count in patterns.most_common():
    print(f"{pattern}: {count}")

print("\n=== DETAILED EDIT SEQUENCE ===")
with open(file_path, 'r') as f:
    edits = []
    for line in f:
        try:
            obj = json.loads(line)
            if obj.get('tool') == 'Edit':
                output = obj.get('output', '{}')
                if isinstance(output, str):
                    output_obj = json.loads(output)
                    filepath = output_obj.get('filePath', '')
                    old_str_preview = output_obj.get('oldString', '')[:60]
                    new_str_preview = output_obj.get('newString', '')[:60]
                    edits.append({
                        'file': filepath.split('\\')[-1] if filepath else 'unknown',
                        'old': old_str_preview,
                        'new': new_str_preview
                    })
        except:
            pass

for i, edit in enumerate(edits, 1):
    print(f"{i}. {edit['file']}")
    print(f"   OLD: {edit['old'][:40]}...")
    print(f"   NEW: {edit['new'][:40]}...")
