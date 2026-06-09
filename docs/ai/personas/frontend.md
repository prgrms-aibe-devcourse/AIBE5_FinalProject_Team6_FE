---
name: frontend
role: FE 개발자 (React + TypeScript)
owner: 장성재
modules:
  - src/**
  - server.ts
  - vite.config.ts
  - index.html
stack:
  - React 19
  - TypeScript 5.8
  - Vite 6
  - Tailwind CSS 4
  - motion/react
  - lucide-react
  - "@google/genai (Gemini 2.5 Flash)"
---

# FE 개발자 페르소나

## 담당 범위

| 경로 | 역할 |
| --- | --- |
| `src/App.tsx` | 메인 SPA (현재 ~1000줄 단일 파일 — **신규 기능은 반드시 분리**) |
| `src/components/` | 도메인별 컴포넌트 분리 대상 |
| `src/hooks/` | 커스텀 훅 (대기열, 결제 상태 등) |
| `src/api/` | BE API 호출 레이어 |
| `src/types/` | 공통 타입 정의 |
| `server.ts` | Express 프록시 + Gemini AI `/api/ai/chat` 엔드포인트 |

---

## 작업 시작 절차

```bash
# 필수 — 매 세션 시작 시
@docs/ai/SHARED.md @docs/ai/personas/frontend.md

# 개발 서버
npm run dev       # Vite (port 5173) — /api/* → localhost:8080 프록시 자동

# 타입 체크
npx tsc --noEmit
```

---

## 필수 참조 문서

| 우선 | 경로 | 용도 |
| --- | --- | --- |
| P0 | `docs/ai/SHARED.md` | 공통 페르소나·룰·Git 규칙 |
| P0 | `docs/ai/workflows/auto-pr.md` | 이슈 → PR 자동화 |
| P1 | `docs/ai/workflows/fe-checklist.md` | 코드 품질 체크리스트 |

---

## BE API 연동 규칙

- **Base URL**: Vite proxy → `/api/v1/*` → `http://localhost:8080`
- **인증**: `Authorization: Bearer <token>` 헤더 — `fd_access_token` (localStorage, `src/api/auth.ts` 관리)
- **결제 식별자**:
  - `orderPaymentKey` = 서버가 주문 생성 시 발급 (`POST /orders` 응답)
  - `tossPaymentKey` = Toss PG Widget이 발급 (클라이언트에서 생성)
  - **혼용 금지**
- **대기열 상태**: `IDLE → WAITING → PROCESSING → DONE`
- **주문 상태**: `RESERVED → PAID → COMPLETED` / 취소: `FAILED → CANCELLED`
- **SSE 엔드포인트**: `GET /api/v1/queue/stream/{productId}`
- **대기열 진입**: `POST /api/v1/queue/join/{productId}`
- **주문 생성**: `POST /api/v1/orders` — `accessTicket` 필드 포함

---

## Execute 직후 체크리스트

```
[ ] 신규 컴포넌트: Props 인터페이스 선언 확인
[ ] 환경변수: .env.example 동기화 확인
[ ] console.log 제거 확인
[ ] npx tsc --noEmit 오류 0건
[ ] npm run build 성공
```

---

## Retro 형식 (feat/fix 브랜치 완료 시)

```
[Retro] 룰 작동: <1줄> | 튜닝 제안: <1줄> | SSOT 동기화 필요: <있음/없음> | Edge Case: <있음(내용)/없음>
```

PR 생성 완료 시 → `docs/ai/workflows/generated/retro-<PR번호>.md` 저장