## 📝 작업 내용

- `ArtistAvatar` 컴포넌트 신규 구현 (`profileImageUrl` 우선, fallback 그라데이션+텍스트)
- `FanArtistEntry` 타입 + 유틸 함수 3종 (`toFanArtistEntry`, `enrichFanArtist`, `fanArtistGradient`) 추가
- `JoinedArtistResponse`에 `artistName?` / `profileImageUrl?` 추가
- FanApp 전 영역 아티스트 아바타를 `ArtistAvatar` 컴포넌트로 교체

## 🧪 기술적 의사결정

기존 `artistGradient()` + 인라인 div 패턴이 FanApp.tsx 곳곳에 중복 존재했다. `FanArtistEntry`를 SSOT로 삼고 `ArtistAvatar` 하나로 통합해 profileImage 유무에 따라 분기하도록 설계했다. `enrichFanArtist()`는 팔로우 목록(이름 미포함)과 storeArtists 카탈로그를 런타임에 병합해 별도 API 추가 없이 실제 이름·이미지를 채운다.

## 📌 주요 변경사항

- `src/components/ArtistAvatar.tsx`: 신규 (44줄)
- `src/types/artist.ts`: `FanArtistEntry` 인터페이스 + 유틸 3종 추가
- `src/types/feed.ts`: `JoinedArtistResponse.artistName?` / `profileImageUrl?` 추가
- `src/apps/FanApp.tsx`: `artistGradient` 제거, `FanArtistEntry` 강타입화, `ArtistAvatar` 전체 적용, `boardArtist` useMemo 추가

## 🔗 연관 이슈

Closes #115

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [ ] `npm run build` 성공
- [ ] sandbox 모드 정상 동작 확인
- [ ] `.env.example` 업데이트 (신규 env 변수 추가 시)
- [x] `console.log` 제거
- [x] PR base `develop` 확인
