## 📝 작업 내용

AGENCY 대시보드에서 아티스트 멤버 프로필 이미지를 업로드할 때 사용하는 presigned URL 엔드포인트를 에이전시 공용(`/agency/...`) 대신 멤버 전용(`/artist-members/{id}/profile-image/presigned-url`)으로 교체하고, 이름 수정과 이미지 업로드를 별도 API 호출로 분리한다.

- `UpdateArtistMemberRequest`에서 `profileImageUrl?` 필드 제거 (이름 수정 전용으로 단순화)
- `requestMemberProfileImagePresignedUrl(memberId, contentType, contentLength)` API 함수 추가  
  → `POST /api/v1/artist-members/{id}/profile-image/presigned-url`
- `updateMemberProfileImage(memberId, imageUrl)` API 함수 추가  
  → `PATCH /api/v1/artist-members/{id}/profile-image`
- `AgencyApp.handleMemberSave` 로직 수정: 멤버 이름 수정 → (파일 있으면) presigned URL 발급 → S3 업로드 → 이미지 URL 업데이트 순으로 실행

## ✅ Definition of Done

- [x] `requestMemberProfileImagePresignedUrl` / `updateMemberProfileImage` 함수 구현
- [x] `handleMemberSave`에서 멤버 전용 presigned URL 사용
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] sandbox 모드 정상 동작

## 📅 마감 기한

2026-06-23

## 🔗 Related

- API: `POST /api/v1/artist-members/{id}/profile-image/presigned-url`
- API: `PATCH /api/v1/artist-members/{id}/profile-image`
