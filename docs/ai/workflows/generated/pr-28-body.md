## 📝 작업 내용

- [x] `src/types/notice.ts` 신규 — `NoticeResult`, `NoticeListResponse` 타입 정의
- [x] `src/api/notices.ts` 신규 — `getNotices`, `getNotice`, `createNotice` 함수
- [x] `FanApp.tsx` — 공지 mock 4개 제거, `selectedArtist` 변경 시 `getNotices` 호출, 렌더링 필드 실 API 응답 기반으로 수정
- [x] `AgencyApp.tsx` — 공지 mock 3개 제거, `notices` 메뉴 진입 시 `getNotices` 호출, `addNotice` → `createNotice` BE 호출 후 목록 갱신

## 🧪 기술적 의사결정

- **목록 API에서 `content` 포함**: `NoticeListResult` 응답에 이미 `content`가 포함되어 있어, FanApp 상세 오버레이에서 별도 단건 조회(`getNotice`) 없이 목록 데이터 재활용. 네트워크 왕복 1회 절감.
- **AgencyApp 날짜 포맷**: 기존 `fmtSchedule(iso).date` 재활용 — 새 유틸 추가 없이 일관성 유지.
- **FanApp 날짜 포맷**: `fmtNoticeDate` 로컬 함수 추가 — 현재 사용처가 FanApp 1곳뿐이므로 공통 util 분리 보류.

## 📌 주요 변경사항

| 파일 | 변경 |
|---|---|
| `src/types/notice.ts` | 신규 — BE `NoticeResult` / `NoticeListResult` 타입 |
| `src/api/notices.ts` | 신규 — 공지 CRUD API 함수 |
| `src/apps/FanApp.tsx` | mock 제거, `getNotices` useEffect, `tag`→`type` / `date`→`scheduledAt` 렌더링 수정, 상세 본문 `content` 표시 |
| `src/apps/AgencyApp.tsx` | mock 제거, `getNotices` useEffect, `addNotice` async BE 호출로 교체 |

## 🔗 연관 이슈

Closes #28

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [ ] `npm run build` 성공
- [ ] sandbox 모드 정상 동작 확인
- [ ] `.env.example` 업데이트 (신규 env 변수 추가 시)
- [x] `console.log` 제거
- [x] PR base `develop` 확인