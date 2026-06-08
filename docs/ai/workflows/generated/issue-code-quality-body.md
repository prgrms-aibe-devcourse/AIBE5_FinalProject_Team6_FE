## 📝 작업 내용

ErrorBoundary 컴포넌트 추가 및 API 레이어 분리를 진행합니다.

- `src/components/ErrorBoundary.tsx` 신규 생성 (렌더링 오류 catch + fallback UI)
- `src/main.tsx`: App을 ErrorBoundary로 래핑
- `src/api/queue.ts` 신규 생성 (대기열 join, status 조회, SSE 생성)
- `src/api/orders.ts` 신규 생성 (주문 생성 API)
- `src/api/payments.ts` 신규 생성 (결제 confirm, webhook 시뮬레이션)
- `src/App.tsx`: 직접 fetch 호출 → api 레이어 함수로 위임

## ✅ Definition of Done

- [ ] ErrorBoundary가 렌더링 오류를 catch하고 fallback UI를 렌더링함
- [ ] App.tsx 내 직접 fetch 호출 제거 완료
- [ ] sandbox/real 양 모드 정상 동작
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] `npm run build` 성공

## 📅 마감 기한

2026-06-08

## 🔗 Related

FE 구조 평가 — 개선 필요 항목 (에러 바운더리 없음, API 레이어 fetch가 App.tsx 내부에 직접)