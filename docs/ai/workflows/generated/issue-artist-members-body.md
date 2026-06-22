## 📝 작업 내용

AgencyApp "Artist & Members" 탭을 BE 실 API에 연동한다.

### API 연동 범위
- `GET /api/v1/artists/{id}` — 아티스트 공개 프로필 상세 (bio, SNS URL)
- `PATCH /api/v1/agency/artists/{id}` — bio·SNS 수정
- `POST /api/v1/agency/artists/{id}/profile-image/presigned-url` → S3 업로드 → `PATCH /api/v1/agency/artists/{id}/profile-image`
- `GET /api/v1/agency/artists/{id}/members` — 멤버 목록
- `POST /api/v1/artist-members` — 멤버 추가
- `PATCH /api/v1/artist-members/{id}` — 멤버 수정
- `DELETE /api/v1/artist-members/{id}` — 멤버 삭제

### 구현 내용
1. `src/api/agencyArtists.ts` 확장 — 프로필 조회/수정, 이미지 presigned, 멤버 목록 조회
2. `src/api/artistMembers.ts` 신규 — 멤버 생성/수정/삭제
3. `src/types/artist.ts` — `ArtistPublicProfile`, `ArtistMember` 타입 추가
4. `AgencyApp.tsx` — `agencyArtistId` 변경 시 프로필+멤버 API 로드, 로컬 상태 제거
5. 프로필 이미지 클릭 → 파일 선택 → presigned 업로드 플로우
6. 멤버 추가/수정/삭제 — API 연동 (저장 후 목록 재조회)
7. 멤버 role UI 제거 (BE 필드 없음), memberName 만 표시

## ✅ Definition of Done

- [ ] agencyArtistId 전환 시 프로필·멤버 API 재로드
- [ ] 프로필 수정 저장 → PATCH 호출 후 UI 반영
- [ ] 프로필 이미지 변경 → presigned → S3 → PATCH 완료
- [ ] 멤버 추가/수정/삭제 → API 호출 후 목록 갱신
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] `npm run build` 성공
- [ ] sandbox 모드 정상 동작

## 📅 마감 기한

2026-06-30

## 🔗 Related

- #20 (Phase 4 AgencyApp 실 API 연동)
- `GET /api/v1/agency/artists` (기존)
- `GET /api/v1/artists/{id}` (신규 연동)
