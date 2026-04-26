#!/bin/bash
# PostToolUse hook: Edit/Write/MultiEdit 후 TypeScript 컴파일 자동 확인
INPUT=$(cat)
FILE=$(echo "$INPUT" | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" \
  2>/dev/null)

[[ -z "$FILE" ]] && exit 0

if [[ "$FILE" == *.ts || "$FILE" == *.tsx ]]; then
  result=$(npx tsc --noEmit 2>&1 | tail -10)
  [[ $? -ne 0 ]] && echo "⚠ TypeScript 오류:" && echo "$result"
fi
