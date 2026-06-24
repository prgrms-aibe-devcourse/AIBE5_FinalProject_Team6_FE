## 📝 작업 내용

`src/components/DevSwitcher.tsx`에 "🛠 DEV ONLY · 배포 시 제거" 주석이 명시되어 있으나, 코드 레벨에서 조건이 없어 프로덕션 배포 시에도 역할 전환 버튼이 사용자에게 노출된다.

### 변경 범위
- `src/App.tsx` — DevSwitcher 렌더링을 `import.meta.env.DEV` 조건부로 감싸기
  ```tsx
  {import.meta.env.DEV && <DevSwitcher />}
  ```
- `.env.development` (필요 시) — 개발 환경 전용 환경변수 확인
- 빌드 후 프로덕션 번들에 DevSwitcher 코드가 포함되지 않는지 확인

## ✅ Definition of Done

- [ ] `npm run build` 후 프로덕션 빌드에서 DevSwitcher 미노출
- [ ] `npm run dev`에서는 DevSwitcher 정상 동작
- [ ] `npx tsc --noEmit` 오류 0건

## 🔗 Related

- `src/components/DevSwitcher.tsx` ("DEV ONLY" 주석)
- `src/App.tsx:41`