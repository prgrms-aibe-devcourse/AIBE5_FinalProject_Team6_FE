## 📝 작업 내용

ARTIST 피드 카드의 작성자 표시를 그룹명(`selectedArtist.name`) 대신 **멤버명**으로 교체한다.

- 보드 진입 시 `getArtistMembersList(artistId)` 호출 → `memberId → memberName` 맵 생성
- ALL 탭 피드 카드(`fp-author` ~L1739): `post.artistMemberId` 있으면 `memberMap[id] ?? currentMemberName`, 없으면 그룹명 유지
- ARTIST 탭 피드 카드(`fp-author` ~L1841): 동일 로직 적용
- 그룹명(`selectedArtist.name`)은 보드 헤더에만 노출

## ✅ Definition of Done

- [x] `memberMap` state 추가 및 피드 로드 시 멤버 목록 병렬 요청
- [x] ALL/ARTIST 탭 `fp-author` 멤버명 표시
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] sandbox 모드: NovaSera 로그인 → 피드 작성 → 작성자 "세라" 표시 확인

## 📅 마감 기한

2026-06-23

## 🔗 Related

- `src/apps/FanApp.tsx`
- `src/api/artist.ts` → `getArtistMembersList`
- `src/types/feed.ts` → `FeedResponse.artistMemberId`
