## 📝 작업 내용

ESLint(flat config) 및 vitest 개발 도구를 설정합니다.

- ESLint: `eslint.config.js` 생성, `@typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` 규칙 적용
- vitest: `vite.config.ts`에 `test` 설정 추가, `jsdom` 환경 구성, `@testing-library/react` 세팅
- `package.json`: `lint`, `test` 스크립트 추가

## ✅ Definition of Done

- [ ] `npm run lint` 실행 가능 (오류 0건)
- [ ] `npm run test` 실행 가능
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] `npm run build` 성공

## 📅 마감 기한

2026-06-08

## 🔗 Related

FE 구조 평가 — 개선 필요 항목 (ESLint, 테스트 설정 없음)