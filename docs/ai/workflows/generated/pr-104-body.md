## 📝 작업 내용

- [x] `src/api/auth.ts` — `getSubFromToken(): number | null` export 추가 (JWT sub → artistMemberId)
- [x] `src/api/artist.ts` — `getArtistMembersList(artistId)` 추가 (`GET /api/v1/artists/{id}/members`)
- [x] `src/apps/FanApp.tsx` — ARTIST init: `getMyArtistMember()` 제거, JWT sub + `getArtists()` + `getArtistMembersList()` parallel 조회로 교체
- [x] 조회 완료 시 `setSelectedArtist` 직접 호출 + `setBoardTab('FEED')` + URL `?artistId=&board=feed` (replace) — 마운트 즉시 보드 진입
- [x] URL→state sync: `role === 'ARTIST'` 일 때 `artistId` 없어도 `setSelectedArtist(null)` 하지 않음

## 🧪 기술적 의사결정

- BE에 `GET /api/v1/artist-members/me`가 미구현이므로 공개 엔드포인트 2개로 대체. `getArtists()`로 그룹 목록을 받은 뒤 각 그룹에 대해 `getArtistMembersList()` parallel 호출 → JWT sub와 일치하는 멤버를 찾는 방식. 그룹 수가 소규모(MVP)이므로 성능 이슈 없음.
- `setSelectedArtist`를 init 시점에 직접 호출해 `favoriteArtists → auto-select useEffect` 2-hop을 제거. ARTIST 보드는 항상 자신의 그룹이므로 URL에 `artistId`가 없어도 selectedArtist를 null로 초기화하지 않음.

## 📌 주요 변경사항

- `src/api/auth.ts`: `getSubFromToken()` 추가
- `src/api/artist.ts`: `getArtistMembersList()` 추가
- `src/apps/FanApp.tsx`: ARTIST init useEffect 교체, URL sync 조건 수정

## 🔗 연관 이슈

Closes #104

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [x] `npm run build` 성공
- [x] sandbox 모드에서 정상 동작 확인
- [ ] `.env.example` 업데이트 (신규 env 변수 추가 시)
- [x] `console.log` 제거
- [x] PR base `develop` 확인