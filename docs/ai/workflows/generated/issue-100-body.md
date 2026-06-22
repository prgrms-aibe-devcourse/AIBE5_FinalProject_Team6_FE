## 📝 작업 내용

ARTIST role 로그인 후 보드 헤더에 그룹명(NOVA), 피드 작성자·댓글에 멤버명(하늘)을 표시한다.
현재 `getJoinedArtists()`(팬 API)로 컨텍스트를 잡아 `Artist #1` placeholder가 노출되는 버그 수정.

- `src/types/artist.ts` — `MyArtistMemberResult` 타입 추가 (`id, artistId, memberName, loginId, profileImageUrl, groupName`)
- `src/api/artistMembers.ts` — `getMyArtistMember()` 추가 (`GET /api/v1/artist-members/me`)
- `src/apps/FanApp.tsx` — ARTIST role 시 `getJoinedArtists()` 대신 `getMyArtistMember()` 호출, `currentMemberName` state 추가, 피드/댓글 author에 `memberName` 사용

## ✅ Definition of Done

- [ ] NovaHaneul / Test1234! 로그인 → 헤더 NOVA, 피드 작성자 하늘
- [ ] NovaSera 로그인 → 헤더 NOVA, 피드 작성자 세라
- [ ] FAN role `getJoinedArtists()` 동작 영향 없음
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] sandbox 모드 정상 동작

## 📅 마감 기한

2026-06-22

## 🔗 Related

- BE 선행 작업: `GET /api/v1/artist-members/me` (`@PreAuthorize("hasRole('ARTIST')")`)
- 응답 필드: `id, artistId, memberName, loginId, profileImageUrl, groupName`