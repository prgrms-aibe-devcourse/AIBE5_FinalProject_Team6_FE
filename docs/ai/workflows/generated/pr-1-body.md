## 📝 작업 내용

- [x] `eslint.config.js` 생성 (flat config, `@typescript-eslint` + `react-hooks` + `react-refresh` 규칙)
- [x] `vitest.config.ts` 생성 (jsdom 환경, `@testing-library/react` 세팅)
- [x] `src/test/setup.ts` 생성 (`@testing-library/jest-dom`, `scrollIntoView` mock)
- [x] `src/test/App.smoke.test.tsx` 생성 (sandbox 모드 렌더링 스모크 테스트 2건)
- [x] `package.json` `lint`/`test` 스크립트 추가
- [x] `App.tsx` 기존 lint 오류 수정 (미사용 import 8개, `Date.now()` lazy initializer, unused vars, catch 바인딩)
- [x] `server.ts` `error: any` → `unknown` 타입 수정

## 🧪 기술적 의사결정

- **vitest.config.ts 분리**: `vite.config.ts`에 `test` 블록을 넣으면 Vite 타입에서 `UserConfigExport`가 `test` 필드를 인식하지 못하는 TS 오류 발생 → 별도 `vitest.config.ts`(vitest/config `defineConfig` 사용)로 분리
- **`Date.now()` lazy initializer**: `react-hooks/purity` 규칙(v7)이 render 시점의 impure 함수 호출을 금지 → `useState(() => ...)` 형태로 초기화 이동

## 📌 주요 변경사항

- `eslint.config.js` (신규)
- `vitest.config.ts` (신규)
- `src/test/setup.ts` (신규)
- `src/test/App.smoke.test.tsx` (신규)
- `package.json` (scripts 추가 + devDependencies 추가)
- `src/App.tsx` (lint 오류 수정)
- `server.ts` (타입 수정)

## 🔗 연관 이슈

Closes #1

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [x] `npm run build` 성공
- [x] `npm run lint` 오류 0건
- [x] `npm run test` 2/2 통과
- [x] sandbox 모드 정상 동작 확인
- [x] PR base `develop` 확인