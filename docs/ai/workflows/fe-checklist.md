# FE 코드 품질 체크리스트

신규 기능 구현 또는 컴포넌트 수정 완료 후 아래 항목을 순서대로 확인한다.

---

## TypeScript

- [ ] `any` 타입 사용 없음 (불가피 시 주석으로 이유 명시)
- [ ] 신규 컴포넌트 Props 인터페이스 선언 완료
- [ ] `npx tsc --noEmit` 오류 0건

## 컴포넌트 구조

- [ ] 단일 파일 **300줄 이하** (초과 시 `src/components/` 하위로 분리)
- [ ] `key` prop 누락 없음 (`.map()` 리스트 렌더링)
- [ ] Props drilling 3단계 이상이면 Context 검토 (또는 이슈 등록)

## API 연동

- [ ] `isSandbox` 분기: sandbox 모드와 real API 모드 **양쪽** 구현
- [ ] `fetch` 오류 처리 (`try/catch` 필수)
- [ ] 로딩 상태 UI 구현 (`Loader2` 스피너 또는 skeleton)
- [ ] `orderPaymentKey` vs `tossPaymentKey` **혼용 금지** 확인
- [ ] SSE 연결 해제 (`sse.close()`) cleanup 처리

## 환경변수

- [ ] 신규 `process.env.*` / `import.meta.env.VITE_*` → `.env.example` 동기화

## 코드 클린업

- [ ] `console.log` 제거 완료
- [ ] 미사용 import 제거
- [ ] TODO/FIXME 주석 처리 또는 이슈 등록

## 접근성 (기본)

- [ ] `<img>` 태그 `alt` 속성 명시
- [ ] 의미 없는 버튼에 `aria-label` 추가

## 빌드

- [ ] `npm run build` 성공 (경고 최소화)
- [ ] Vite proxy `/api/*` → `localhost:8080` 동작 확인 (백엔드 실행 시)

---

## 컴포넌트 분리 기준

| 조건 | 조치 |
| --- | --- |
| 단일 파일 300줄 초과 | `src/components/<Domain>/` 하위로 분리 |
| 동일 UI 패턴 3회 이상 반복 | 공통 컴포넌트 추출 |
| 비즈니스 로직과 UI가 혼재 | 커스텀 훅(`src/hooks/`)으로 로직 분리 |
| fetch 코드가 컴포넌트 내부 | `src/api/<domain>.ts` 레이어로 분리 |

> **현재 App.tsx (~1000줄)**: 신규 기능 추가 시 기존 코드를 건드리지 않고 분리된 파일로 구현한다.