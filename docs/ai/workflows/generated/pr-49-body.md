## 📝 작업 내용

- [x] `src/types/banner.ts` — `StoreBannerResponse` 타입 추가 (`productId`, `status` 필드 포함)
- [x] `src/api/banners.ts` — `getStoreBanners()` 추가 (`GET /api/v1/store-banners`)
- [x] `src/apps/FanApp.tsx` — 스토어 배너 API로 교체, 배너 클릭 시 `productId` 상품 상세 이동 또는 `landingUrl` 새 탭 오픈

## 🧪 기술적 의사결정

- **`getMainBanners` 제거 아닌 유지**: 홈 메인 배너(`/banners/main`)는 별도 도메인(user 모듈)이므로 함수는 남기고 스토어 탭에서만 `getStoreBanners`로 교체.
- **클릭 우선순위**: `productId` 있으면 storeItems에서 조회 후 상품 상세 진입, 없으면 `landingUrl` 새 탭 — 추가 API 호출 없이 이미 로드된 데이터 재활용.

## 📌 주요 변경사항

| 파일 | 변경 |
|---|---|
| `src/types/banner.ts` | `StoreBannerResponse` 인터페이스 추가 |
| `src/api/banners.ts` | `getStoreBanners()` 함수 추가 |
| `src/apps/FanApp.tsx` | import 교체, state 타입 교체, useEffect API 교체, 배너 onClick 추가 |

## 🔗 연관 이슈

Closes #49

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [ ] `npm run build` 성공
- [ ] sandbox 모드 정상 동작 확인
- [ ] `.env.example` 업데이트 (신규 env 변수 추가 시)
- [x] `console.log` 제거
- [x] PR base `develop` 확인
