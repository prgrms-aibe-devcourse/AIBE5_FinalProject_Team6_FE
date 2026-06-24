## 📝 작업 내용

- [x] `src/lib/fetchWithAuth.ts` 신규 — 401 자동 갱신 인터셉터
- [x] 모든 인증 필요 API 파일 `fetchWithAuth`로 교체 (products / community / cart / orders / payments / agencyApplications / queue)
- [x] `App.tsx` DevSwitcher를 `import.meta.env.DEV` 조건부 렌더링으로 변경

## 🧪 기술적 의사결정

**동시 다발 401 단일 refresh 패턴 선택**
탭 전환 시 여러 API가 동시에 401을 반환할 수 있어, `refreshing` Promise를 모듈 수준 변수로 공유한다. 첫 번째 401만 실제 refresh를 호출하고 나머지는 같은 Promise를 await 하여 중복 호출을 방지했다.

**Authorization 헤더 마지막 주입**
기존 호출부에서 넘어온 stale token이 있어도, `fetchWithAuth` 내부에서 `...getAuthHeaders()`를 headers 객체 마지막에 spread 함으로써 retry 시 항상 fresh token으로 덮어쓰도록 했다.

## 📌 주요 변경사항

- `src/lib/fetchWithAuth.ts` (신규) — 401 retry + RTR refresh + redirect 로직
- `src/App.tsx` — `{import.meta.env.DEV && <DevSwitcher />}` 조건부 렌더링
- `src/api/products.ts`, `community.ts`, `cart.ts`, `orders.ts`, `payments.ts`, `agencyApplications.ts`, `queue.ts` — `fetch(` → `fetchWithAuth(` 교체

## 🔗 연관 이슈

Closes #27 Closes #31

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [ ] `npm run build` 성공
- [x] sandbox 모드 정상 동작 확인
- [ ] `.env.example` 업데이트 (신규 env 변수 추가 시)
- [x] `console.log` 제거
- [x] PR base `develop` 확인
