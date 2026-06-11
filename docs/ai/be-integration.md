# BE 연동 작업 계획 — Mock 제거 & 실 API 교체

> **목적:** FanApp / AgencyApp의 모든 하드코딩 mock 데이터를 BE 실 API로 교체한다.
> **이슈 링크:** #17 · #18 · #19 · #20 · #21 (Blocker)

---

## 세션 시작 방법 (새 대화를 열었을 때)

이 작업을 이어받는 새 세션은 아래 순서대로 문서를 로드하면 완전한 컨텍스트가 된다.

### 1단계 — 필수 로드 (3개)
```
@docs/ai/SHARED.md
@docs/ai/personas/frontend.md
@docs/ai/be-integration.md        ← 이 파일
```

### 2단계 — BE API 응답 형식 확인 (1개)
```
@FANDROPS_BE/docs/api/api-contract.md
```
> 응답 envelope `{ success, data, error, traceId }`, 에러코드 목록, cursor 페이지네이션 형식이 여기에 있다.

### 3단계 — 작업할 Phase의 BE 컨트롤러 (필요 시만)
Phase 1 진행 시에만 추가로 읽는다. 매번 다 읽을 필요 없음.

| Phase | 읽어야 할 BE 파일 |
|---|---|
| Phase 1 (상품/장바구니/배너) | `ProductController.java` · `CartController.java` · `BannerController.java` |
| Phase 2 (커뮤니티) | `FeedController.java` · `CommentController.java` · `FeedLikeController.java` · `ArtistFollowController.java` · `FanMypageController.java` |
| Phase 3 (이벤트/알림) | `ScheduleController.java` · `GoodsVoteController.java` · `AttendanceController.java` · `NotificationController.java` |
| Phase 4 (AgencyApp) | Phase 1~3 컨트롤러 + Agency 전용 엔드포인트 확인 |

### 4단계 — 작업할 FE 파일
```
@src/apps/FanApp.tsx        ← mock 데이터가 있는 메인 파일 (3287줄)
@src/api/auth.ts            ← 인증 헬퍼 (getAuthHeaders, getFanIdHeader)
```

### 세션 시작 프롬프트 예시
```
@docs/ai/SHARED.md @docs/ai/personas/frontend.md @docs/ai/be-integration.md
@FANDROPS_BE/docs/api/api-contract.md

be-integration.md의 Phase 1 작업을 이어서 진행해줘. 이슈 #17.
```

---

---

## Phase 개요

| Phase | 이슈 | 범위 | 상태 |
|---|---|---|---|
| Phase 1 | [#17](https://github.com/prgrms-aibe-devcourse/AIBE5_FinalProject_Team6_FE/issues/17) | STORE 탭 — 상품 목록 / 장바구니 / 배너 | ⏳ 대기 |
| Phase 2 | [#18](https://github.com/prgrms-aibe-devcourse/AIBE5_FinalProject_Team6_FE/issues/18) | 커뮤니티 — 피드 / 댓글 / 좋아요 / 팔로우 | ⏳ 대기 |
| Phase 3 | [#19](https://github.com/prgrms-aibe-devcourse/AIBE5_FinalProject_Team6_FE/issues/19) | 이벤트 — 스케줄 / 투표 / 출석 / 알림 | ⏳ 대기 |
| Phase 4 | [#20](https://github.com/prgrms-aibe-devcourse/AIBE5_FinalProject_Team6_FE/issues/20) | AgencyApp — 상품 / 투표 / 스케줄 관리 | ⏳ 대기 |
| Blocker | [#21](https://github.com/prgrms-aibe-devcourse/AIBE5_FinalProject_Team6_FE/issues/21) | 아티스트 프로필 조회 API — BE 대응 필요 | 🚫 차단 |

---

## 새로 생성할 파일

```
src/api/
  cart.ts          # Phase 1
  banners.ts       # Phase 1
  community.ts     # Phase 2  (feeds, comments, likes, follows)
  schedule.ts      # Phase 3
  votes.ts         # Phase 3
  attendance.ts    # Phase 3
  notifications.ts # Phase 3

src/types/
  cart.ts          # CartResponse, CartItemResponse
  banner.ts        # BannerResponse
  feed.ts          # FeedResponse, FeedListResult, CommentResponse
  schedule.ts      # ScheduleResult, CalendarResponse
  vote.ts          # GoodsVoteResponse, VoteOption, BallotResponse
  notification.ts  # NotificationResponse, NotificationListResult
```

---

## Phase 1 — STORE 탭 (#17)

### 제거 대상 (FanApp.tsx)
| 제거할 mock | 교체 API |
|---|---|
| `DUMMY_STORE_ITEMS` (8개) | `GET /api/v1/products?type=regular&cursor=&size=20` |
| Cart drawer 하드코딩 2개 항목 | `GET /api/v1/cart` |
| `STORE_HERO_SLIDES` (배너) | `GET /api/v1/banners/main` |

### 신규 API 함수
```ts
// src/api/cart.ts
getCart()                              // GET  /api/v1/cart
addCartItem(productId, quantity)       // POST /api/v1/cart/items
updateCartItem(itemId, quantity)       // PATCH /api/v1/cart/items/{id}
removeCartItem(itemId)                 // DELETE /api/v1/cart/items/{id}

// src/api/banners.ts
getMainBanners()                       // GET /api/v1/banners/main
```

### 제외 (별도 blocker)
- `ALL_ARTISTS` 필터 — BE 아티스트 목록 API 미구현, Phase 1에서는 "전체" 단일 탭만 유지

---

## Phase 2 — 커뮤니티 (#18)

### 제거 대상 (FanApp.tsx)
| 제거할 mock | 교체 API |
|---|---|
| `allPosts` (4개) | `GET /api/v1/artists/{artistId}/feeds` |
| `commentsMap` (p1 하드코딩) | 댓글 목록 API (BE 확인 필요) |
| `favoriteArtists` | `GET /api/v1/fans/me/artists` |

### 신규 API 함수
```ts
// src/api/community.ts
getFeeds(artistId, cursor, size)                  // GET  /api/v1/artists/{artistId}/feeds
createFeed(artistId, content, imageUrls)          // POST /api/v1/artists/{artistId}/feeds
deleteFeed(artistId, feedId)                      // DELETE /api/v1/artists/{artistId}/feeds/{feedId}
createComment(feedId, content, parentId?)         // POST /api/v1/feeds/{feedId}/comments
likeFeed(feedId, artistId)                        // POST /api/v1/feeds/{feedId}/likes
unlikeFeed(feedId, artistId)                      // DELETE /api/v1/feeds/{feedId}/likes
followArtist(artistId)                            // POST /api/v1/artists/{artistId}/follow
unfollowArtist(artistId)                          // DELETE /api/v1/artists/{artistId}/follow
getJoinedArtists(cursor, size)                    // GET  /api/v1/fans/me/artists
```

### 헤더 요구사항 (중요)
- 피드/댓글/좋아요: `X-Artist-Id` 헤더 필수 (팬이 보는 아티스트 ID)
- 팔로우/언팔로우: FAN role + `X-Fan-Id` 헤더
- 피드 작성(아티스트): `X-Artist-Member-Id` 헤더

---

## Phase 3 — 이벤트/알림 (#19)

### 제거 대상 (FanApp.tsx)
| 제거할 mock | 교체 API |
|---|---|
| `schedules` (4개) | `GET /api/v1/artists/{artistId}/calendar?from=&to=` |
| `goodsVotes` (4개) | `GET /api/v1/artists/{artistId}/goods-votes` |
| `notifications` (4개) | `GET /api/v1/fans/me/notifications` |

### 유지할 mock (BE 미구현)
- `notices` (공지사항) — BE 공지 API 미구현, **mock 유지**

### 신규 API 함수
```ts
// src/api/schedule.ts
getCalendar(artistId, from, to)                   // GET /api/v1/artists/{artistId}/calendar

// src/api/votes.ts
getVotes(artistId, cursor, size)                  // GET /api/v1/artists/{artistId}/goods-votes
castBallot(voteId, optionId)                      // POST /api/v1/goods-votes/{id}/ballots

// src/api/attendance.ts
getAttendanceEvents(artistId)                     // GET /api/v1/artists/{artistId}/attendance-events
checkIn(eventId)                                  // POST /api/v1/attendance-events/{eventId}/check-in

// src/api/notifications.ts
getNotifications(cursor, size)                    // GET /api/v1/fans/me/notifications
markAsRead(notificationId)                        // PATCH /api/v1/fans/me/notifications/{id}/read
```

---

## Phase 4 — AgencyApp (#20)

### 제거 대상 (AgencyApp.tsx)
| 제거할 mock | 교체 API |
|---|---|
| `votesList` | `GET /api/v1/artists/{artistId}/goods-votes` |
| `banners` | Admin 배너 API (확인 필요) |
| `artists` | `GET /api/v1/fans/me/artists` (소속 아티스트) |
| `schedules` | `GET /api/v1/artists/{artistId}/calendar` |

---

## Blocker — 아티스트 프로필 API (#21)

### 현황
```
GET /api/v1/fans/me/artists
→ { items: [{ artistId, followedAt }], nextCursor, hasMore }
   ↑ artistName, profileImageUrl 없음!
```

### 영향
- STORE 아티스트 필터 (Phase 1에서 전체만 노출)
- 커뮤니티 아티스트 선택 UI (Phase 2 임시 fallback)
- AgencyApp 소속 아티스트 표시 (Phase 4)

### 요청 (BE팀)
1. `GET /api/v1/artists/{artistId}` 단건 조회 추가
2. 또는 `GET /api/v1/fans/me/artists` 응답에 `artistName`, `profileImageUrl` 추가

---

## 전역 헤더 정책

```ts
// 이미 구현된 auth.ts 헬퍼
getAuthHeaders()    // { Authorization: 'Bearer <token>' }
getFanIdHeader()    // { 'X-Fan-Id': '<fanId>' }

// Phase 2에서 신규 추가 필요
getArtistIdHeader(artistId: number)        // { 'X-Artist-Id': '<id>' }
getArtistMemberIdHeader(memberId: number)  // { 'X-Artist-Member-Id': '<id>' }
```

---

## 기존 구현 (이미 연동됨 — 건드리지 말 것)

| 파일 | 연동 상태 |
|---|---|
| `src/api/auth.ts` | ✅ 완료 |
| `src/api/orders.ts` | ✅ 완료 |
| `src/api/payments.ts` | ✅ 완료 |
| `src/api/queue.ts` | ✅ 완료 |
| `src/api/agencyApplications.ts` | ✅ 완료 |
| `src/hooks/useQueue.ts` | ✅ 완료 |
| `src/hooks/useCheckout.ts` | ✅ 완료 |
| `src/api/products.ts` | ✅ API 있음, FanApp 연결 필요 (Phase 1) |