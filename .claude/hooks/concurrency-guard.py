#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FANDROPS FE — concurrency-guard stub
BE 세션의 PostToolUse 훅이 FE 경로에서 실행될 때 조용히 종료합니다.
FE는 서버 동시성 이슈가 없으므로 별도 동작 없음.
"""
import sys
import json


def main() -> None:
    try:
        json.load(sys.stdin)
    except Exception:
        pass


if __name__ == "__main__":
    main()