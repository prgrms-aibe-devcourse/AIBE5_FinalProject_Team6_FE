## 📝 작업 내용

- [x] `src/api/auth.ts` — `adminLogin()` 추가 (`POST /api/v1/admin/auth/login`), 5xx 구분 에러 처리
- [x] `src/apps/AdminLoginPage.tsx` (신규) — "관리자 로그인" 페이지, B2B 폼과 동일 디자인 톤
- [x] `src/App.tsx` — `/admin/login` 라우트 추가, ADMIN RequireRole 미인증 시 `/admin/login` 리다이렉트
- [x] `src/apps/LoginPage.tsx` — 하단 "관리자이신가요? 관리자 로그인 →" 링크 추가

## 🧪 기술적 의사결정

- `POST /api/v1/auth/login`에 admin 계정이 없어 별도 엔드포인트(`/api/v1/admin/auth/login`) 사용. `adminLogin()` 함수에서 5xx를 별도 에러 코드(`'server_error'`)로 분기해 기존 `login()`의 단일 401 메시지 문제도 함께 개선.
- `RequireRole`에서 `allowed`가 `['ADMIN']` 단독일 때만 `/admin/login`으로 리다이렉트해 다른 role(FAN/AGENCY/ARTIST)의 가드 동작에 영향 없음.

## 📌 주요 변경사항

- `src/api/auth.ts`: `adminLogin()` 추가
- `src/apps/AdminLoginPage.tsx`: 신규 파일
- `src/App.tsx`: 라우트 + RequireRole 수정
- `src/apps/LoginPage.tsx`: 관리자 로그인 링크 추가

## 🔗 연관 이슈

Closes #100

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [x] `npm run build` 성공
- [x] sandbox 모드에서 정상 동작 확인
- [ ] `.env.example` 업데이트 (신규 env 변수 추가 시)
- [x] `console.log` 제거
- [x] PR base `develop` 확인