## 📝 작업 내용

`/login` 통합 로그인 UI 개편 및 `/signup` 팬 회원가입 폼 보완.

**LoginPage.tsx:**
- `showB2BForm` 토글 · 「기획사/아티스트 전용 로그인」 링크 · 「Agency Login」 구분선 · 「← 뒤로가기」 버튼 제거
- 소셜 버튼 + 통합 이메일/아이디 폼을 단일 화면으로 통합
- `──── 또는 ────` 구분선 추가
- 소셜 버튼 하단 안내 문구 추가
- `login()` → JWT role 기반 `getRoleHomePath()` 자동 라우팅 (Fan/Agency/Artist 동일 폼)

**SignupPage.tsx:**
- 제목: 「팬 계정 만들기」
- 이용약관 체크박스 UI (미체크 시 submit 불가, `termsAgreed: true` 전송)
- 비밀번호 FE 검증: 최소 8자
- 기획사·아티스트 계정 안내 + `/apply` 링크 추가
- LoginPage와 동일 카드·배경·버튼 스타일 유지

**auth.ts:**
- `signup(email, password, nickname, termsAgreed: boolean)` — 하드코딩 `termsAgreed: true` → 파라미터로 교체

**PasswordResetPage.tsx:**
- 이메일 가입(LOCAL) 팬 전용 안내 문구 추가

## ✅ Definition of Done

- [x] `/login` 단일 화면: 소셜 + 통합 이메일/아이디 폼
- [x] B2B 토글 완전 제거
- [x] `/signup` 약관 체크 + 비밀번호 8자 검증
- [x] `auth.ts` `signup` 시그니처 `termsAgreed` 파라미터화
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] `npm run build` 통과
- [ ] sandbox QA: fan/agency/artist 자동 라우팅, /signup 약관 미체크 시 제출 차단

## 📅 마감 기한

2026-06-23

## 🔗 Related

- `src/apps/LoginPage.tsx`
- `src/apps/SignupPage.tsx`
- `src/apps/PasswordResetPage.tsx`
- `src/api/auth.ts`
- BE API: `POST /api/v1/auth/login`, `POST /api/v1/auth/signup` (변경 없음)
