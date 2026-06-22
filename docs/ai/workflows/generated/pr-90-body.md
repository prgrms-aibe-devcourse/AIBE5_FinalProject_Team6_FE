## 📝 작업 내용

- [x] `src/types/artist.ts` — `ArtistPublicProfile`, `ArtistMember` 타입 추가
- [x] `src/api/agencyArtists.ts` — 프로필 조회/수정, 이미지 presigned, 멤버 목록 함수 추가
- [x] `src/api/artistMembers.ts` — 신규: 멤버 생성/수정/삭제
- [x] `src/apps/AgencyApp.tsx` — Artist & Members 탭 전체 BE 연동

## 🧪 기술적 의사결정

- **프로필 상세 분리**: `GET /api/v1/agency/artists`는 탭 목록용으로 유지하고, 상세 정보(`bio`, SNS URL)는 `GET /api/v1/artists/{id}`로 분리 로드. `agencyArtistId` 변경 시 profile + members 동시 조회(`Promise.all`).
- **프로필 이미지 업로드**: 아바타 hover → 파일 선택 → `POST presigned-url` → S3 PUT → `PATCH profile-image` 3단계 플로우. `useRef<HTMLInputElement>`로 hidden input 트리거.
- **멤버 이미지 업로드**: 편집 모달 내 file input → `URL.createObjectURL`로 미리보기 → 저장 시 기존 `requestAgencyPresignedUrl` 재사용해 S3 업로드.
- **member.role 제거**: BE 스펙에 필드 없음 → UI에서 완전 제거. `memberName`만 표시.
- **로컬 `ArtistProfile` 인터페이스 제거**: `editingArtist: any`, `editingMember: any` → 타입 안전한 `profileEditForm`, `MemberEditForm` state로 교체.

## 📌 주요 변경사항

| 파일 | 변경 내용 |
|---|---|
| `src/types/artist.ts` | `ArtistPublicProfile` (id·name·bio·SNS URL), `ArtistMember` (id·memberName·profileImageUrl) 추가 |
| `src/api/agencyArtists.ts` | `getArtistPublicProfile`, `updateArtistProfile`, `requestArtistProfileImagePresignedUrl`, `updateArtistProfileImage`, `getArtistMembers` 추가 |
| `src/api/artistMembers.ts` | `createArtistMember`, `updateArtistMember`, `deleteArtistMember` 신규 |
| `src/apps/AgencyApp.tsx` | 로컬 상태 제거 및 API 연동, 프로필/멤버 모달 전면 개편, 474행 `ㄱ` 제거 |

## 🔗 연관 이슈

Closes #90
Related #20

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [x] `npm run build` 성공
- [ ] sandbox 모드 정상 동작 확인
- [x] `.env.example` 업데이트 (신규 env 없음)
- [x] `console.log` 제거
- [x] PR base `develop` 확인