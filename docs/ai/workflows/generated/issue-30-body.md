## 📝 작업 내용

상품 상세 및 스토어 목록에서 "재입고 알림 신청하기" 버튼이 현재 alert()만 호출한다. 실 API 연동이 필요하다.

### 현재 상태
- `src/apps/FanApp.tsx:2144` — 재입고 알림 버튼 onClick이 alert() 호출
- `src/apps/FanApp.tsx:2488` — 스토어 목록 카드의 재입고 알림 버튼도 동일

### 변경 범위
- `src/api/products.ts` — 재입고 구독 함수 추가
  - `subscribeRestock(productId)` → `POST /api/v1/products/{id}/restock-subscribe`
  - `unsubscribeRestock(productId)` → `DELETE /api/v1/products/{id}/restock-subscribe`
- `src/apps/FanApp.tsx` — 버튼 onClick에서 API 호출, 구독 상태 토글 UI 반영

### BE API
- `POST /api/v1/products/{id}/restock-subscribe` → `201 { alertId }`
- `DELETE /api/v1/products/{id}/restock-subscribe` → `204 No Content`

## ✅ Definition of Done

- [ ] 재입고 알림 신청 시 BE API 호출 및 버튼 상태 변경 (신청 완료 ↔ 취소)
- [ ] 이미 구독 중이면 구독 취소 가능
- [ ] `npx tsc --noEmit` 오류 0건

## 🔗 Related

- BE: `order` 모듈 · `inventory` 모듈 · 담당 형성빈
- mvp-api-spec.md § Product F04-05