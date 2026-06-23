## 📝 작업 내용

- `FanAvatar` 컴포넌트 신규 구현 (`src/components/fanAvatars/`)
- FanApp 헤더 아바타 → `FanAvatar` 교체 (ARTIST role 숨김 처리)
- 마이페이지 보드 헤더 아바타 → `FanAvatar(size=120)` 교체

## 🧪 기술적 의사결정

BE 프로필 이미지 API 없이도 팬마다 고유한 아바타를 표시하기 위해 `fanId` 해시 기반으로 12종 캐릭터 + 12종 파스텔 배경색을 결정했다. 해시 함수(`fanId % 12`, `(fanId * 11 + 7) % 12`)로 캐릭터와 배경색을 독립 배정하여 동일 `fanId`면 항상 동일한 아바타를 재현한다. SVG 마스코트는 외부 에셋 없이 인라인 Path로 구성해 번들 사이즈 영향 없음.

## 📌 주요 변경사항

- `src/components/fanAvatars/fanAvatarUtils.ts`: 인덱스·배경색 결정 유틸 (12종 팔레트)
- `src/components/fanAvatars/FanMascotArt.tsx`: 12종 SVG 마스코트 컴포넌트
- `src/components/fanAvatars/FanAvatar.tsx`: `FanAvatarProps` 인터페이스 + 원형 아바타 렌더러
- `src/apps/FanApp.tsx`: 헤더·마이페이지 보드 헤더 아바타 교체

## 🔗 연관 이슈

Closes #111

## ✅ 셀프 체크리스트

- [x] `npx tsc --noEmit` 오류 0건
- [ ] `npm run build` 성공
- [ ] sandbox 모드 정상 동작 확인
- [ ] `.env.example` 업데이트 (신규 env 변수 추가 시)
- [x] `console.log` 제거
- [x] PR base `develop` 확인
