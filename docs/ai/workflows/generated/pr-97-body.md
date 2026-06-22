## 📝 작업 내용

- [x] `isArtistAuthorized` state 및 mock "Artist Login" 2차 인증 UI 완전 삭제 (`FanApp.tsx` 741~797줄)
- [x] ARTIST role은 JWT 인증만으로 WORKSPACE 직행, `favoriteArtists[0]` 자동 선택 useEffect 유지
- [x] 홈 "인기 드롭" SOLD OUT 카드 클릭 가드(`if (!isSoldOut)`) 제거 — 품절 상품도 상품 상세로 이동
- [x] SOLD OUT 카드 커서 `pointer`로 통일, opacity 0.7 스타일 유지

## 🧪 기술적 의사결정

- mock 폼은 API 없이 `setState`만 하는 개발 잔재였으므로 단순 삭제. 아티스트는 LoginPage B2B 폼(`/login`)에서 `/api/v1/auth/login`으로 이미 JWT를 발급받아 `/artist`로 진입하므로 2차 인증이 필요 없음.
- SOLD OUT 상품도 상세에서 "재입고 알림" UX를 제공해야 하므로, 스토어 탭과 동일한 `setSelectedProduct + setActiveTab('STORE')` 흐름으로 통일.

## 📌 주요 변경사항

- `src/apps/FanApp.tsx`: `isArtistAuthorized` state 삭제, mock Artist Login early-return 블록 삭제, 홈 인기 드롭 SOLD OUT 클릭 가드 제거

## 🔗 연관 이슈

Closes #97
Closes #98

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [x] `npm run build` 성공
- [x] sandbox 모드에서 정상 동작 확인
- [ ] `.env.example` 업데이트 (신규 env 변수 추가 시)
- [x] `console.log` 제거
- [x] PR base `develop` 확인
