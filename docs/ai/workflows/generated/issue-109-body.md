## 📝 작업 내용

Admin Content Monitoring 및 Orders & Payments 탭 UI 개선 (mock 유지, BE API 연동 없음).

**Content Monitoring:**
- Posts | Comments 탭 분리
- 상태 뱃지 추가: SPAM / REPORTED / APPROVED
- "샘플 데이터" 라벨 표시
- 삭제 버튼 유지, 기존 mock 데이터 구조 확장

**Orders & Payments:**
- "샘플 데이터" 라벨 표시
- 상태 뱃지 컬러 코딩 (Payment Complete / Shipping / Refunded)

FANDROPS Admin 디자인 톤(#111, #F7F3EE) 유지.

## ✅ Definition of Done

- [x] Content Monitoring Posts/Comments 탭 구현
- [x] 상태 뱃지 (SPAM/REPORTED/APPROVED) 표시
- [x] Orders 탭 "샘플 데이터" 라벨 및 상태 뱃지 개선
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] sandbox 모드 정상 동작

## 📅 마감 기한

2026-06-23

## 🔗 Related

- `src/apps/AdminApp.tsx` → `content` / `orders` 섹션 (L431~498)
