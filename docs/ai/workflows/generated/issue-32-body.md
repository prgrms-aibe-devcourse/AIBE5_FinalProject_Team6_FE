## 📝 작업 내용

LoginPage의 "회원가입"·"비밀번호 찾기" 버튼에 onClick 핸들러가 없다. 실서비스에서 팬이 신규 가입하거나 비밀번호를 재설정할 수 없다.

### 현재 상태
- `src/apps/LoginPage.tsx:119` — `<button>비밀번호 찾기</button>` (onClick 없음)
- `src/apps/LoginPage.tsx:121` — `<button>회원가입</button>` (onClick 없음)

### 변경 범위
**회원가입**
- `/signup` 라우트 및 SignupPage 컴포넌트 추가 (이메일, 비밀번호, 닉네임 입력)
- `src/api/auth.ts` — `signup(email, password, nickname)` 함수 추가
- BE: `POST /api/v1/auth/signup` → `{ fanId, accessToken, refreshToken }`

**비밀번호 재설정**
- `/password-reset` 라우트 및 PasswordResetPage 컴포넌트 추가 (이메일 입력 → 메일 발송)
- `/password-reset/confirm` 라우트 — 토큰 + 새 비밀번호 입력
- BE: `POST /api/v1/auth/password-reset/request`, `POST /api/v1/auth/password-reset/confirm`

## ✅ Definition of Done

- [ ] 회원가입 완료 후 자동 로그인 및 `/fan` 이동
- [ ] 비밀번호 재설정 메일 발송 성공 메시지 표시
- [ ] `npx tsc --noEmit` 오류 0건

## 🔗 Related

- BE: `POST /api/v1/auth/signup`, `POST /api/v1/auth/password-reset/*`
- mvp-api-spec.md § Auth / Fan 계정