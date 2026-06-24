## 📝 작업 내용

- [x] `@tosspayments/sdk` (v1) 설치 및 `requestPayment('카드', ...)` 호출 구현
- [x] `createOrder` → Toss 결제창 → `confirmPayment` 전체 플로우 BE 연동
- [x] FE에서 webhook 직접 호출 제거 (`triggerWebhook` 삭제)
- [x] Toss redirect 후 role 복원을 위한 `localStorage('fd_role')` 퍼시스턴스
- [x] `VITE_TOSS_CLIENT_KEY` env 변수 추가 및 `src/vite-env.d.ts` 타입 선언
- [x] mock 결제 로직 전체 제거, BE API 직접 연동
- [x] `ORDER_COMPLETE` 화면 추가 (motion 애니메이션)
- [x] FE persona(`docs/ai/personas/frontend.md`)에 Toss SDK v1 섹션 추가

## 🧪 기술적 의사결정

**Toss SDK v1 선택**: 팀이 도입한 BE API(`POST /api/v1/payments/toss/confirm`)가 v1 플로우 기반이므로 `@tosspayments/sdk` v1을 유지. v2(`@tosspayments/payment-sdk`)는 customerKey 필수 등 다른 초기화 방식으로 BE 수정 필요 — 범위 초과로 v1 유지.

**localStorage role 복원**: Toss 리다이렉트 후 React state가 초기화되어 로그인 화면으로 돌아가는 문제 → `fd_role` 키로 role을 저장하고 `?paymentKey` 파라미터 감지 시 복원. 전역 상태 라이브러리 미도입(MVP) 원칙 준수.

## 📌 주요 변경사항

| 파일 | 변경 내용 |
| --- | --- |
| `src/apps/FanApp.tsx` | 결제 플로우 BE 연동, mock 제거, ORDER_COMPLETE 화면 |
| `src/api/payments.ts` | `triggerWebhook` 제거, `confirmPayment` 유지 |
| `src/App.tsx` | role localStorage 퍼시스턴스 및 Toss 콜백 복원 |
| `src/vite-env.d.ts` | `VITE_TOSS_CLIENT_KEY` 타입 선언 (신규) |
| `.env.example` | `VITE_TOSS_CLIENT_KEY` 추가 |
| `package.json` | `@tosspayments/sdk` 의존성 추가 |
| `docs/ai/personas/frontend.md` | Toss SDK v1 결제 플로우 섹션 추가 |

## 🔗 연관 이슈

Closes #15

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [x] `npm run build` 성공
- [x] sandbox 모드에서 정상 동작 확인
- [x] `.env.example` 업데이트 (신규 env 변수 추가 시)
- [x] `console.log` 제거
- [x] PR base가 `develop`인지 확인