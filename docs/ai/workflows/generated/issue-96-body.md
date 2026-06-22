## 📝 작업 내용

`FanApp.tsx`의 `role === 'ARTIST' && !isArtistAuthorized` 조건으로 렌더하던 mock "Artist Login" 2차 인증 UI를 제거한다.

- `isArtistAuthorized` state 및 관련 early-return 블록(741~799줄) 삭제
- ARTIST role은 `/api/v1/auth/login` JWT 인증만으로 `/artist` → WORKSPACE 직행
- `role === 'ARTIST'` 자동 선택 useEffect(`favoriteArtists[0]` → `selectedArtist`) 유지

## ✅ Definition of Done

- [ ] `isArtistAuthorized` state 및 mock 로그인 폼 UI 완전 삭제
- [ ] artist / Test1234! 로그인 → `/artist` 진입 시 2차 로그인 없이 WORKSPACE 노출
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] sandbox 모드 정상 동작

## 📅 마감 기한

2026-06-22

## 🔗 Related

- LoginPage B2B 폼: `src/pages/LoginPage.tsx`
- 인증 흐름: `src/api/auth.ts`
