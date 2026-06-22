## 📝 작업 내용

Admin 전용 로그인 페이지를 추가한다. `POST /api/v1/auth/login`에 admin 계정이 없으므로 `/api/v1/admin/auth/login` 전용 엔드포인트를 사용해야 한다.

- `src/api/auth.ts` — `adminLogin(email, password)` 추가 (`POST /api/v1/admin/auth/login`)
- `src/apps/AdminLoginPage.tsx` (신규) — "관리자 로그인" 페이지, B2B 폼과 동일 디자인 톤
- `src/App.tsx` — `/admin/login` 라우트 추가, ADMIN RequireRole → `/admin/login` 리다이렉트
- `src/apps/LoginPage.tsx` — 하단 "관리자이신가요? 관리자 로그인 →" 링크 추가 (선택)

## ✅ Definition of Done

- [ ] `admin@fandrops.com / Test1234!` → `/admin` 진입 성공
- [ ] `agency@fandrops.test / artist` → 기존 B2B 폼 정상 동작 (영향 없음)
- [ ] 로그아웃 후 `/admin` 직접 접속 → `/admin/login` 리다이렉트
- [ ] 401 오류: "이메일 또는 비밀번호가 올바르지 않습니다", 5xx: "서버 오류입니다. 잠시 후 다시 시도해주세요"
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] sandbox 모드 정상 동작

## 📅 마감 기한

2026-06-22

## 🔗 Related

- BE Admin 로그인 API: `POST /api/v1/admin/auth/login`
- 일반 B2B 로그인: `POST /api/v1/auth/login` (admin 조회 없음)