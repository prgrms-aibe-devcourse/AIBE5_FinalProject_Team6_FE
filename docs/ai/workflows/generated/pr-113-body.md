## 📝 작업 내용

- `/login` 통합 로그인 UI: 소셜 + 이메일/아이디 폼 단일 화면, B2B 토글 제거
- `/signup` 팬 회원가입 폼: 약관 체크박스, 비밀번호 8자 검증, 기획사 안내 추가
- `auth.ts` `signup` 시그니처: `termsAgreed` 파라미터화
- `PasswordResetPage` LOCAL 팬 전용 안내 문구 추가

## 🧪 기술적 의사결정

기존 `showB2BForm` 토글은 Fan/Agency/Artist가 동일 `/api/v1/auth/login` 엔드포인트를 사용하므로 구분할 이유가 없어 제거했다. JWT role에 따른 `getRoleHomePath` 자동 라우팅으로 단일 폼에서 세 role 모두 처리. `signup`에서 `termsAgreed` 하드코딩 제거는 UI 체크박스 상태를 실제로 전달하기 위함이며, 미체크 시 버튼 `disabled` + 제출 전 검증으로 이중 차단한다.

## 📌 주요 변경사항

- `src/apps/LoginPage.tsx`: `showB2BForm` 제거, 통합 폼으로 재작성
- `src/apps/SignupPage.tsx`: 제목·약관 체크박스·PW 8자 검증·기획사 안내 추가
- `src/apps/PasswordResetPage.tsx`: LOCAL 팬 전용 안내 문구
- `src/api/auth.ts`: `signup()` `termsAgreed: boolean` 파라미터 추가

## 🔗 연관 이슈

Closes #113

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [ ] `npm run build` 성공
- [ ] sandbox 모드: fan/agency/artist 자동 라우팅, `/signup` 약관 미체크 제출 차단 확인
- [ ] `.env.example` 업데이트 (신규 env 변수 추가 시)
- [x] `console.log` 제거
- [x] PR base `develop` 확인
