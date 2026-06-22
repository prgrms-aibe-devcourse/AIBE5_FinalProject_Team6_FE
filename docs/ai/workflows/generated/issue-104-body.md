## 📝 작업 내용

`GET /api/v1/artist-members/me` (미구현 BE 엔드포인트) 대신
JWT sub + `GET /api/v1/artists` + `GET /api/v1/artists/{id}/members` 조합으로
로그인한 아티스트 멤버의 memberName·artistId·그룹명을 조회하도록 교체한다.

- `src/api/auth.ts` — `getSubFromToken(): number | null` export 추가 (JWT sub → artistMemberId)
- `src/api/artist.ts` — `getArtistMembersList(artistId)` 추가 (`GET /api/v1/artists/{id}/members`)
- `src/apps/FanApp.tsx`:
  - ARTIST init useEffect: 2단계 조회(artists→members parallel) + `setSelectedArtist` 직접 호출로 마운트 즉시 보드 진입
  - URL sync: `role === 'ARTIST'`일 때 `artistId` 없어도 `setSelectedArtist(null)` 하지 않음

## ✅ Definition of Done

- [ ] NovaHaneul / Test1234! → 2차 로그인 없이 NOVA 보드 즉시 표시, 작성자 하늘
- [ ] NovaSera → 같은 보드, 작성자 세라
- [ ] 새로고침 후 URL에 artistId 있으면 보드 복원
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] sandbox 모드 정상 동작

## 📅 마감 기한

2026-06-23

## 🔗 Related

- 이전 PR #103: ARTIST 로그인 후 그룹명·멤버명 표시 수정
- BE API: `GET /api/v1/artists`, `GET /api/v1/artists/{id}/members`
