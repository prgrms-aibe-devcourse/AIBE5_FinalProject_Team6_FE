#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FANDROPS FE PostToolUse Hook — TypeScript 타입 가드 체크리스트 주입
Edit/Write/MultiEdit 실행 직후 .ts/.tsx 파일 수정 시 tsc 체크 리마인더를 출력한다.
"""
import sys
import json
import re

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return

    file_path: str = data.get("tool_input", {}).get("file_path", "")
    normalized = file_path.replace("\\", "/")

    if not re.search(r"\.(tsx?|ts)$", normalized):
        return

    # server.ts 는 Node 서버이므로 src tsc 대상에서 제외
    if normalized.endswith("server.ts"):
        return

    border = "─" * 54
    print(f"\n{border}")
    print("  [FANDROPS FE] TypeScript 파일 수정 감지")
    print(f"  파일: {file_path}")
    print()
    print("  체크리스트 (personas/frontend.md §Execute 직후)")
    print("  1. npx tsc --noEmit  (타입 오류 0건 확인)")
    print("  2. Props 인터페이스 선언 여부 확인")
    print("  3. any 타입 사용 여부 확인")
    print("  4. console.log 잔류 확인")
    print(f"{border}\n")


if __name__ == "__main__":
    main()