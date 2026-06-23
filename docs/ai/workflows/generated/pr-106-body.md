## 📝 작업 내용

- `requestMemberProfileImagePresignedUrl` API 함수 추가 (`POST /api/v1/artist-members/{id}/profile-image/presigned-url`)
- `updateMemberProfileImage` API 함수 추가 (`PATCH /api/v1/artist-members/{id}/profile-image`)
- `UpdateArtistMemberRequest`에서 `profileImageUrl?` 필드 제거
- `AgencyApp.handleMemberSave` — 이름 수정과 이미지 업로드를 분리 처리

## 🧪 기술적 의사결정

기존에는 에이전시 공용 presigned URL(`requestAgencyPresignedUrl`)을 멤버 이미지에도 재사용하고 있었으나, BE가 멤버 전용 엔드포인트를 별도로 제공함에 따라 책임을 분리했다. 이미지 업로드가 없을 때 `updateArtistMember`가 이름만 수정하도록 인터페이스를 단순화하여 불필요한 `profileImageUrl` 전달을 제거했다.

## 📌 주요 변경사항

- `src/api/artistMembers.ts`: `UpdateArtistMemberRequest` 타입 수정 + `requestMemberProfileImagePresignedUrl` / `updateMemberProfileImage` 함수 추가
- `src/apps/AgencyApp.tsx`: `handleMemberSave` presigned URL 로직 교체 및 import 추가

## 🔗 연관 이슈

Closes #106

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [ ] `npm run build` 성공
- [ ] sandbox 모드 정상 동작 확인
- [ ] `.env.example` 업데이트 (신규 env 변수 추가 시)
- [x] `console.log` 제거
- [x] PR base `develop` 확인
