## 📝 작업 내용

`FanApp.tsx` 홈 "인기 드롭" 섹션에서 SOLD OUT 상품 카드 클릭을 차단하던 가드(`if (!isSoldOut)`)를 제거하고, 스토어 탭과 동일하게 상품 상세로 이동하도록 수정한다.

- 카드 `onClick` 에서 `if (!isSoldOut)` 분기 제거
- SOLD OUT 카드도 `setSelectedProduct + setActiveTab('STORE')` 실행
- 카드 커서를 `pointer`로 통일 (opacity 0.7 스타일은 유지)
- 상세 화면의 "재입고 알림" 버튼 동작은 기존 그대로

## ✅ Definition of Done

- [ ] SOLD OUT 카드 클릭 시 스토어 탭 상품 상세로 이동
- [ ] 상세 화면에서 "재입고 알림" 버튼 정상 노출
- [ ] 카드 sold-out opacity 스타일 유지
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] sandbox 모드 정상 동작

## 📅 마감 기한

2026-06-22

## 🔗 Related

- 스토어 탭 SOLD OUT 상세 이동: `FanApp.tsx` STORE 섹션
- 재입고 알림 API: `src/api/products.ts` `subscribeRestock`