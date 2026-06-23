## 📝 작업 내용

아티스트 아바타 컴포넌트 `ArtistAvatar` 신규 추가 및 FanApp 전체 적용.

- `src/components/ArtistAvatar.tsx` 신규: `profileImageUrl` 있으면 `<img>`, 없으면 그라데이션+이름 텍스트 fallback
- `src/types/artist.ts`: `FanArtistEntry` 인터페이스, `toFanArtistEntry()` / `enrichFanArtist()` / `fanArtistGradient()` 유틸 추가
- `src/types/feed.ts`: `JoinedArtistResponse`에 `artistName?` / `profileImageUrl?` 필드 추가
- `src/apps/FanApp.tsx`:
  - 인라인 `artistGradient()` 함수 제거 → `fanArtistGradient()`(types)로 통합
  - `favoriteArtists` / `selectedArtist` 타입 `FanArtistEntry`로 강타입화
  - `boardArtist` useMemo 추가 (enriched 아티스트)
  - 아티스트 검색·팔로우 목록·보드 헤더·피드 아바타·아티스트 카드 등 전 영역 `ArtistAvatar` 컴포넌트로 교체
  - 팔로우 아티스트 목록 로드 시 `artistName`, `profileImageUrl` 반영

## ✅ Definition of Done

- [x] `ArtistAvatar` Props 인터페이스 선언
- [x] `profileImageUrl` / 그라데이션 fallback 분기
- [x] FanApp 전 영역 `ArtistAvatar` 적용
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] sandbox 모드: 아티스트 카드·보드 헤더·피드 아바타 표시 확인

## 📅 마감 기한

2026-06-23

## 🔗 Related

- `src/components/ArtistAvatar.tsx`
- `src/types/artist.ts`
- `src/types/feed.ts`
- `src/apps/FanApp.tsx`
