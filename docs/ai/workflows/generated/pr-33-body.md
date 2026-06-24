## 📝 작업 내용

- [x] `src/api/artist.ts` 신규 — `getArtists()` → `GET /api/v1/artists?sort=fanCount`
- [x] `src/types/artist.ts` 신규 — `ArtistItem`, `ArtistListResult` 타입 정의
- [x] `src/api/products.ts` — `getProducts()`에 `artistId?: number` 파라미터 추가
- [x] `src/apps/FanApp.tsx` — 스토어 아티스트 필터 탭 동적 로딩, products 재fetch, profileImageUrl 렌더링

## 🧪 기술적 의사결정

BE PR #300(merged)이 `GET /api/v1/products?artistId={id}` 서버사이드 필터를 추가함에 따라 클라이언트 필터링 대신 서버사이드 필터링을 채택.
아티스트 탭 클릭 시 `storeArtist` 상태가 변경되고, `[storeArtist]` 의존 useEffect가 커서를 초기화한 뒤 해당 `artistId`로 상품 목록을 재fetch함.
아티스트 목록은 `GET /api/v1/artists?sort=fanCount&size=50`으로 팬 수 순 정렬해 로드.

## 📌 주요 변경사항

- 신규: `src/api/artist.ts` — `getArtists(cursor?, size?, sort?)`
- 신규: `src/types/artist.ts` — `ArtistItem { id, name, fanCount?, profileImageUrl? }`, `ArtistListResult`
- 수정: `src/api/products.ts` — `artistId?: number` 파라미터 + URLSearchParams 조건부 추가
- 수정: `src/apps/FanApp.tsx`
  - `storeArtists` 상태 추가
  - 마운트 시 `getArtists()` 호출 useEffect 추가
  - 초기 products 로드 `useEffect([], [])` → `useEffect([storeArtist])` 교체
  - `handleLoadMore`에 `artistId` 전달
  - 필터 탭 UI: `favoriteArtists` → `storeArtists` (profileImageUrl 있으면 `<img>`, 없으면 이니셜 3자 fallback)
  - 필터 칩: `storeArtists.find()`로 아티스트명 표시

## 🔗 연관 이슈

Closes #33
Related to BE PR: prgrms-aibe-devcourse/AIBE5_FinalProject_Team6_BE#300

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [x] `npm run build` 성공
- [ ] sandbox 모드에서 정상 동작 확인
- [x] `.env.example` 업데이트 (신규 env 변수 없음)
- [x] `console.log` 제거
- [x] PR base가 `develop`인지 확인