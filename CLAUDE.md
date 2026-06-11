# FANDROPS FE — Claude Code

**진입 문서:** [`docs/ai/README.md`](docs/ai/README.md)

1. 공통: [`docs/ai/SHARED.md`](docs/ai/SHARED.md) — **매 세션 필수** (`@docs/ai/SHARED.md`)
2. 페르소나: [`docs/ai/personas/frontend.md`](docs/ai/personas/frontend.md) — **매 세션 필수** (`@docs/ai/personas/frontend.md`)

작업 전 **전체 docs를 읽지 말 것.** SHARED + persona 만 `@` 로 로드한다.

---

## 도메인 라우팅

| 작업 경로 | 로드할 문서 |
| --- | --- |
| `src/**` | `@docs/ai/SHARED.md` `@docs/ai/personas/frontend.md` |
| `server.ts` · `.env*` | `@docs/ai/SHARED.md` `@docs/ai/personas/frontend.md` |
| PR/이슈 작성 | `@docs/ai/workflows/auto-pr.md` 추가 로드 |
| 컴포넌트 분리·품질 점검 | `@docs/ai/workflows/fe-checklist.md` 추가 로드 |
| **BE 연동 작업** (`src/api/**` · `src/types/**` · mock 제거 · Phase 1~4) | `@docs/ai/SHARED.md` `@docs/ai/personas/frontend.md` `@docs/ai/be-integration.md` + `@FANDROPS_BE/docs/api/api-contract.md` |