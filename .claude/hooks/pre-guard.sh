#!/bin/bash
# PreToolUse hook: Bash 실행 전 위험 명령 차단
INPUT=$(cat)
CMD=$(echo "$INPUT" | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" \
  2>/dev/null)

# main 브랜치 직접 푸 
# force push 차단
if echo "$CMD" | grep -qE "git push.*(--force|-f)"; then
  echo '{"decision":"block","reason":"Force push 금지."}'
  exit 0
fi

# .env.production 수정 차단
if echo "$CMD" | grep -qE "\.env\.production|\.env\.prod"; then
  echo '{"decision":"block","reason":".env.production 직접 수정 금지."}'
  exit 0
fi

# 글로벌 ~/.claude/ 수정 차단
if echo "$CMD" | grep -qE "(rm|mv|chmod|chown|>|>>).*~/.claude/"; then
  echo '{"decision":"block","reason":"글로벌 ~/.claude/ 수정 금지. 프로젝트 .claude/ 만 수정 가능."}'
  exit 0
fi

echo '{"decision":"approve"}'
