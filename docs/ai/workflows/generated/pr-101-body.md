## 📝 작업 내용

- [x] `src/types/artist.ts` — `MyArtistMemberResult` 타입 추가 (`id, artistId, memberName, loginId, profileImageUrl, groupName`)
- [x] `src/api/artistMembers.ts` — `getMyArtistMember()` 추가 (`GET /api/v1/artist-members/me`)
- [x] `src/apps/FanApp.tsx` — ARTIST role 시 `getJoinedArtists()` 대신 `getMyArtistMember()` 호출, `favoriteArtists[0].name` = `groupName`, `currentMemberName` state = `memberName`
- [x] 피드/댓글 작성자 `author` — ARTIST role 시 `currentMemberName` 사용 (그룹명 대신 멤버명)

## 🧪 기술적 의사결정

- `getJoinedArtists()`는 팬 API(`/fans/me/artists`)로 ARTIST role에 사용하면 403 가능성이 있고, 반환값에 그룹명·멤버명 정보가 없음. ARTIST role 전용 `GET /api/v1/artist-members/me`로 교체.
- `favoriteArtists` 구조(`{ id, name, bg }`)는 그대로 유지해 기존 보드 렌더링 코드에 영향 없음. `name`에 `groupName`을 넣어 보드 헤더(`bh-name`)에 그룹명(NOVA)이 표시되도록 함.
- `currentMemberName`은 댓글/피드 작성자 표시 전용 별도 state로 분리해 그룹명과 멤버명을 명확히 구분.

## 📌 주요 변경사항

- `src/types/artist.ts`: `MyArtistMemberResult` 타입 추가
- `src/api/artistMembers.ts`: `getMyArtistMember()` 추가
- `src/apps/FanApp.tsx`: ARTIST role 분기 + `currentMemberName` state

## 🔗 연관 이슈

Closes #101

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [x] `npm run build` 성공
- [x] sandbox 모드에서 정상 동작 확인
- [ ] `.env.example` 업데이트 (신규 env 변수 추가 시)
- [x] `console.log` 제거
- [x] PR base `develop` 확인