## 📝 작업 내용

AgencyApp 대시보드에 상품 수정·재입고, 공지·투표 상세 보기, 주문·재고 목록 필터/페이지네이션을 추가한다.

### 상품 관리 (`products` 메뉴)
- 상품 카드 클릭 → 상세 모달 (상품명·가격 인라인 수정, 재고 현황, 드롭 일정 수정)
- 품절 처리 — `PATCH /api/v1/products/{id}` (`status: SOLD_OUT`)
- 재입고 — `POST /api/v1/products/{id}/restock` (수량 입력)
- `updateProduct()`, `restockProduct()` API 함수 추가 (`src/api/products.ts`)

### 공지사항 (`notices` 메뉴 / 스케줄)
- 공지 행/카드 클릭 → 상세 모달 (`getNotice(artistId, noticeId)`)
- 스케줄 목록에서 `type === 'NOTICE'` 항목도 동일 모달 연결

### 투표 (`votes` 메뉴)
- 투표 카드 클릭 → 결과 모달 (옵션별 비율 바 차트, CLOSED 투표 그레이아웃)

### 주문 내역 (`orders` 메뉴)
- 상태 필터 (`PAID / RESERVED / COMPLETED / CANCELLED / FAILED`)
- 주문번호 검색
- 결제금액 컬럼 추가
- 커서 기반 "더 보기" 페이지네이션 (`loadOrders()` 헬퍼)

### 재고 이력 (`inventory` 메뉴)
- 상품 필터 드롭다운 (artistId 기준 상품 목록 로드)
- 변경 전(`qtyBefore`) / 변경 후(`qtyAfter`) 컬럼 추가
- 변경 유형 한글 레이블 (`RESERVE→선점`, `INCREASE→입고` 등)
- 커서 기반 "더 보기" 페이지네이션 (`loadInventory()` 헬퍼)
- 읽기 전용으로 변경 (재고 보정 버튼 제거)

## ✅ Definition of Done

- [ ] 상품 상세 모달에서 수정·품절·재입고 정상 동작
- [ ] 공지 상세 모달 정상 표시
- [ ] 투표 결과 모달 정상 표시
- [ ] 주문 필터·검색·페이지네이션 정상 동작
- [ ] 재고 이력 필터·페이지네이션 정상 동작
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] sandbox 모드 정상 동작

## 📅 마감 기한

2026-06-30

## 🔗 Related

- Closes #20 (Phase 4 AgencyApp 실 API 연동 — 주문·재고 부분)
- `PATCH /api/v1/products/{id}`
- `POST /api/v1/products/{id}/restock`
- `GET /api/v1/artists/{artistId}/notices/{noticeId}`
