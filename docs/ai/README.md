# FANDROPS FE — AI 워크플로우 가이드

## 빠른 시작

세션 시작 시 반드시 로드:

```
@docs/ai/SHARED.md @docs/ai/personas/frontend.md
```

PR/이슈 작업 시 추가:

```
@docs/ai/workflows/auto-pr.md
```

---

## 문서 목록

| 파일 | 용도 |
| --- | --- |
| [SHARED.md](SHARED.md) | 공통 페르소나·룰·Git 규칙·아키텍처 금지 |
| [personas/frontend.md](personas/frontend.md) | FE 담당 범위·API 규칙·체크리스트 |
| [workflows/auto-pr.md](workflows/auto-pr.md) | 이슈 생성 → 구현 → PR 자동화 |
| [workflows/fe-checklist.md](workflows/fe-checklist.md) | TypeScript·컴포넌트·API·빌드 품질 체크 |

---

## 훅 동작

| 훅 파일 | 트리거 | 동작 |
| --- | --- | --- |
| `.claude/hooks/type-guard.py` | Edit/Write `.ts`/`.tsx` 수정 시 | TypeScript 체크리스트 컨텍스트 주입 |
| `.claude/hooks/retro-reminder.py` | Stop (feat/fix 브랜치) | Retro 4-field 리마인더 출력 |

---

## 브랜치 전략

```
main       ← 릴리스용 (직접 push 금지)
  └─ develop  ← 기본 작업 브랜치
       └─ feat/<이슈번호>  ← 기능 개발
       └─ fix/<이슈번호>   ← 버그 수정
```