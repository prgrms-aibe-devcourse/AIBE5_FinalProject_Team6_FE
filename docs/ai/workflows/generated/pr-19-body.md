## 📝 작업 내용

- [x] `src/api/schedule.ts` — `getCalendar(artistId, from?, to?)` 생성
- [x] `src/api/votes.ts` — `getVotes(artistId)`, `castBallot(voteId, optionId)` 생성
- [x] `src/api/attendance.ts` — `getAttendanceEvents(artistId)`, `checkIn(eventId)` 생성
- [x] `src/api/notifications.ts` — `getNotifications()`, `markAsRead(id)` 생성
- [x] `src/types/schedule.ts`, `vote.ts`, `attendance.ts`, `notification.ts` 타입 정의 생성
- [x] `FanApp.tsx` — `schedules` / `goodsVotes` / `notifications` mock 제거 → 실 API 교체
- [x] `FanApp.tsx` — 출석 배너 클릭 시 `checkIn(activeAttendanceEvent.id)` API 연결
- [x] `docs/ai/be-integration.md` — Phase 3 완료(✅) 상태 반영, Phase 4 블로커(#35) 추가

## 🧪 기술적 의사결정

**goodsVotes options 플래팅 방식 선택**
BE `GoodsVoteResult`는 `options[]`를 포함한 중첩 구조이지만, FanApp VOTE 탭은 선택지 단위 카드 UI를 유지해야 했다. `vote.options`를 `flatMap`으로 펼쳐 `(voteId, voteTitle, opt)` 튜플로 변환했다. `hasVoted`는 `voteId` 기준으로 추적하여 1인 1표 제약을 클라이언트 단에서도 적용했다.

**schedules 월별 동적 그루핑**
하드코딩된 `'2026.05'`·`'2026.06'` 필터를 제거하고 `groupSchedulesByMonth()` 헬퍼로 교체했다. `ScheduleResult.startTime`(UTC)을 KST(+9h)로 변환 후 `YYYY.MM` 키로 `Map`에 그룹핑하여 어떤 월이든 동적으로 렌더링한다.

**알림 Mark all as read 비동기 처리**
기존 로컬 state 업데이트만 하던 버튼을 `Promise.all(unread.map(markAsRead))`로 교체했다. API 실패 시에도 UI가 블록되지 않도록 개별 `.catch(() => {})`를 적용했다.

## 📌 주요 변경사항

- `src/api/schedule.ts` (신규)
- `src/api/votes.ts` (신규)
- `src/api/attendance.ts` (신규)
- `src/api/notifications.ts` (신규)
- `src/types/schedule.ts`, `vote.ts`, `attendance.ts`, `notification.ts` (신규)
- `src/apps/FanApp.tsx` — mock 4종 제거, API useEffect 2개 추가, 렌더링 필드 매핑 업데이트
- `docs/ai/be-integration.md` — Phase 3 ✅, Phase 4 블로커 #35 기록

## 🔗 연관 이슈

Closes #19

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [x] `npm run build` 성공
- [ ] sandbox 모드 정상 동작 확인
- [x] `.env.example` 업데이트 (신규 env 변수 없음)
- [x] `console.log` 제거
- [x] PR base `develop` 확인