## 📝 작업 내용

- [ ] `src/api/products.ts` — `updateProduct()`, `restockProduct()` API 함수 추가
- [ ] `src/apps/AgencyApp.tsx` — 상품/공지/투표 상세 모달, 주문·재고 필터·페이지네이션 추가

## 🧪 기술적 의사결정

- **커서 기반 페이지네이션**: `loadOrders` / `loadInventory`에 `cursor` + `append` 파라미터를 분리해 "더 보기" 방식으로 구현. 전체 재로드 없이 기존 데이터 유지.
- **상품 목록 새로고침 헬퍼**: `refreshProductList(artistId)` 함수로 regular + drops 두 엔드포인트를 `Promise.all`로 병렬 호출 후 통합. 상품 생성·수정·재입고 직후 호출해 상태 일관성 유지.
- **`artistSelect` 인라인 JSX**: votes / notices / products / inventory / orders 헤더에 공통으로 렌더링되는 아티스트 드롭다운을 변수로 추출 (컴포넌트 분리는 이 PR 범위 밖).
- **재고 이력 읽기 전용화**: 직접 재고 보정 버튼 제거, 실제 재입고는 상품 상세 모달의 `POST /restock` 경로로 일원화.

## 📌 주요 변경사항

| 파일 | 변경 내용 |
|---|---|
| `src/api/products.ts` | `UpdateProductRequest` 인터페이스, `updateProduct()` (PATCH), `restockProduct()` (POST) 추가 |
| `src/apps/AgencyApp.tsx` | 공지 상세 모달, 투표 결과 바 차트 모달, 상품 상세/수정/품절/재입고 모달 추가 |
| `src/apps/AgencyApp.tsx` | 주문 — 상태 필터·주문번호 검색·결제금액 컬럼·더보기 페이지네이션 |
| `src/apps/AgencyApp.tsx` | 재고 이력 — 상품 필터·변경 전후 컬럼·한글 유형 레이블·더보기 페이지네이션 |

## 🔗 연관 이슈

Closes #88
Closes #20

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [ ] `npm run build` 성공
- [ ] sandbox 모드 정상 동작 확인
- [ ] `.env.example` 업데이트 (신규 env 변수 추가 시)
- [x] `console.log` 제거
- [x] PR base `develop` 확인
