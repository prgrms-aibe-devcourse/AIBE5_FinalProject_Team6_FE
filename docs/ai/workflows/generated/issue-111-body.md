## 📝 작업 내용

FAN 전용 기본 아바타 컴포넌트(`FanAvatar`) 신규 구현 및 FanApp 적용.

- `src/components/fanAvatars/fanAvatarUtils.ts`: `fanId` 해시 기반으로 캐릭터(12종) + 파스텔 배경색(12종) 고정 배정 유틸
- `src/components/fanAvatars/FanMascotArt.tsx`: 12종 귀여운 SVG 마스코트 렌더러 (Star/Blob/Squircle/Pea/Cloud/Hill/Egg/Heart/RoseHeart/Slab/Bean/Petal)
- `src/components/fanAvatars/FanAvatar.tsx`: `fanId`, `size`, `border` Props를 받아 원형 아바타를 렌더링하는 컴포넌트
- `FanApp.tsx`: 헤더 아바타 div → `FanAvatar` 교체 (ARTIST role 숨김), 마이페이지 보드 헤더 아바타 → `FanAvatar(size=120)` 교체

## ✅ Definition of Done

- [x] `FanAvatar` 컴포넌트 Props 인터페이스 선언
- [x] fanId 기반 12종 캐릭터 + 12종 배경색 해시 배정
- [x] FanApp 헤더 + 마이페이지 보드 헤더 적용
- [x] ARTIST role 헤더 아바타 숨김 처리
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] sandbox 모드: FAN 로그인 → 헤더 아바타 + 마이페이지 아바타 표시 확인

## 📅 마감 기한

2026-06-23

## 🔗 Related

- `src/components/fanAvatars/`
- `src/apps/FanApp.tsx` (헤더 ~L1302, 마이페이지 보드 헤더 ~L3179)
