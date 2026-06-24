## 📝 작업 내용

스토어 탭의 아티스트 필터가 현재 "ALL" 단일 탭만 노출된다. BE에 `GET /api/v1/artists` 목록 조회 API가 구현되어 있으므로, 동적으로 아티스트 탭을 로드해야 한다.

### 현재 상태
- `src/apps/FanApp.tsx` — 스토어 아티스트 필터 탭이 하드코딩된 "ALL"만 존재
- Phase 1(#17) 작업 시 Blocker(#21) 때문에 "전체 단일 탭만 유지"로 처리

### 변경 범위
- `src/api/artist.ts` (신규) — `getArtists(cursor?, size?)` → `GET /api/v1/artists`
- `src/apps/FanApp.tsx` STORE 탭 — 아티스트 목록 로드 후 필터 탭 렌더링
  - "ALL" 탭 유지 + 팔로우 중인 아티스트 탭 동적 추가
  - 탭 선택 시 `storeArtist` 상태 업데이트 → 상품 목록 필터링

### 의존성
- #21 (아티스트 프로필 API) 해결 시 아티스트명·이미지 함께 표시 가능
- BE: `GET /api/v1/artists?cursor=&size=&sort=fanCount`

## ✅ Definition of Done

- [ ] 스토어 탭 진입 시 아티스트 목록 로드 및 필터 탭 표시
- [ ] 아티스트 탭 클릭 시 해당 아티스트 상품만 필터링
- [ ] `npx tsc --noEmit` 오류 0건

## 🔗 Related

- #17 Phase 1 (STORE API 연동, closed)
- #21 Blocker (아티스트 프로필 API)
- BE: `GET /api/v1/artists`, community 모듈 · 담당 정환철