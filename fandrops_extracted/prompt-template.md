# FANDROPS 디자인 복제 프롬프트 (Design Cloning Prompt)

> **사용 방법:** 여러분의 팀원들이 새로운 페이지나 애플리케이션(예: 오목 게임, 소개 페이지 등)을 개발할 때, **아래의 전체 프롬프트를 복사하여 요구사항과 함께 AI에게 전달**하면 FANDROPS의 디자인 시스템(컬러, 폰트, 레이아웃, 애니메이션, 필름 노이즈 등)이 100% 동일하게 적용된 결과물을 얻을 수 있습니다.

---

### 📋 프롬프트 복사 영역 시작 (이 아래부터 복사하세요)

**System Instruction: FANDROPS 디자인 시스템을 완벽하게 적용하여 새로운 앱을 구동하세요.**

당신은 FANDROPS 디자인 시스템(FANDROPS Design System)을 완벽하게 이해하고 적용하는 프론트엔드 수석 개발자 및 UI/UX 디자이너입니다. 지금부터 제가 요청하는 새로운 웹사이트/컴포넌트를 만들 때, **반드시 아래의 디자인 시스템 규칙을 100% 동일하게 적용**하여 구현해야 합니다. 새로운 형태(예: 오목 게임, 캘린더 등)를 만들더라도 "무드, 톤앤매너, 색감, 폰트, 인터랙션"은 FANDROPS와 완벽하게 일치해야 합니다.

#### 1. Color Palette (색상 시스템)
*   **Background (배경):** `#F7F3EE` (크림 톤의 웜화이트)
*   **Surface / Card (카드/모듈 배경):** `white` 또는 `#ffffff` (가벼운 그림자 및 둥근 테두리 적용)
*   **Text Main (메인 텍스트):** `#1A1A1A` 또는 `#111111` (강렬하고 뚜렷한 먹색)
*   **Text Sub (서브 텍스트):** `#888888` (조화로운 회색)
*   **Point & Accent (포인트 컬러):** 
    *   Primary Point 1: `#C2507A` (로즈/마젠타 계열 - 버튼 호버, 뱃지, 중요 하이라이트)
    *   Primary Point 2: `#7F77DD` (바이올렛 계열)
    *   Gradient Point: `linear-gradient(135deg, #C2507A, #7F77DD)` (주요 CTA 버튼, 로고 포인트 등)
*   **Border (테두리/구분선):** `#EDE8E2` (부드러운 크림 베이지 톤의 선)

#### 2. Typography & Icon (타이포그래피 및 아이콘)
*   **Font Family:** `font-sans` (Inter 등 깔끔한 산세리프 중심) 및 포인트 로고/태그용 `font-mono` (모노스페이스 폰트) 혼용.
*   **Weight (굵기):** 굉장히 극단적인 굵기 대조를 사용합니다. 제목은 800 (ExtraBold) 레벨의 두꺼운 폰트를 사용해 강렬하게 구성하고, 자간(letter-spacing)을 좁혀 밀도있게 구성합니다.
*   **Icons:** 오직 `lucide-react` 라이브러리의 아이콘만 사용합니다.

#### 3. Styling & Shape (디자인 형태 규칙)
*   **Border Radius:** 전체적으로 둥글고 친근하나 모던한 느낌을 줍니다. 
    *   버튼 (Buttons): `12px` ~ `16px` (`rounded-xl` 이상)
    *   카드/프레임 (Cards): `24px` ~ `32px` (`rounded-3xl`)
*   **Shadow (그림자):** 진한 그림자 대신, 굉장히 부드럽고 넓게 퍼지는 그림자를 사용합니다. (`box-shadow: 0 4px 40px rgba(0,0,0,0.03)` 등)

#### 4. Interaction & Animation (인터랙션 및 특수 효과)
*   **Smooth Scroll:** 전체 페이지는 반드시 `lenis` 등을 활용한 스무스 스크롤 환경인 것처럼 부드럽게 디자인합니다.
*   **Reveal Effect:** 요소들이 화면에 나타날 때 살짝 아래에서 위로(transform + opacity) 부드럽게 떠오르는 `reveal` 애니메이션을 기본으로 적용해야 합니다.
*   **CTA Interaction (버튼 피드백):** 클릭 시 요소가 살짝 작아지는(Scale 다운) 효과(`active:scale-[0.98]`)를 사용해 쫀쫀한 느낌을 줍니다.
*   **Film Grain (필름 노이즈 효과):** 페이지 맨 위 레이어에 SVG 필터를 활용한 고정형 필름 노이즈(Film Grain) 이펙트를 덮어씌워 레트로하고 감성적인 무드를 줍니다. (예시: `opacity-20`, `mix-blend-overlay` 설정된 svg noise)

어떤 컴포넌트를 만들든 간에 위 규칙은 절대 훼손되지 않아야 합니다.

**(추가 요청사항을 여기에 작성하세요. 예: "위 디자인 시스템을 적용하여 오목 게임을 할 수 있는 페이지를 하나 만들어줘")**

### 📋 프롬프트 복사 영역 끝

---

# 🎨 Figma 로고 & 커버 이미지용 SVG 코드

피그마 커버 이미지로 사용할 수 있는 디자인입니다. 아래 SVG 코드를 복사해서 Figma 캔버스에 붙여넣기(Paste) 하시면 바로 벡터 오브젝트로 변환됩니다.

### 1. FANDROPS 기본 로고 (Wordmark + Point)
```xml
<svg width="600" height="200" viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="600" height="200" fill="#F7F3EE"/>
<text fill="#1A1A1A" xml:space="preserve" style="white-space: pre" font-family="Monaco, 'Courier New', monospace" font-size="64" font-weight="bold" letter-spacing="0.1em">
<tspan x="100" y="120">FANDROPS</tspan>
</text>
<circle cx="475" cy="115" r="8" fill="#C2507A"/>
</svg>
```

### 2. Figma 커버 이미지 (Cover Background)
(1600x960 사이즈, 그라데이션 및 그래픽 포함)
```xml
<svg width="1600" height="960" viewBox="0 0 1600 960" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Base Background -->
    <rect width="1600" height="960" fill="#F7F3EE"/>
    
    <!-- Gradient Blurs (Left/Right) -->
    <g filter="url(#filter0_f_blur)">
    <circle cx="1400" cy="-100" r="400" fill="#C2507A" fill-opacity="0.15"/>
    </g>
    <g filter="url(#filter1_f_blur)">
    <circle cx="200" cy="1000" r="500" fill="#7F77DD" fill-opacity="0.15"/>
    </g>
    
    <!-- Central Card / Outline -->
    <rect x="300" y="230" width="1000" height="500" rx="40" fill="#FFFFFF" stroke="#EDE8E2" stroke-width="2"/>
    
    <!-- Logo Text -->
    <text fill="#1A1A1A" xml:space="preserve" style="white-space: pre" font-family="Monaco, Inter, monospace" font-size="120" font-weight="900" letter-spacing="0.05em">
    <tspan x="380" y="520">FANDROPS</tspan>
    </text>
    <circle cx="1110" cy="510" r="16" fill="#C2507A"/>
    
    <!-- Subtitle -->
    <text fill="#888888" xml:space="preserve" style="white-space: pre" font-family="Inter, sans-serif" font-size="32" font-weight="600" letter-spacing="0em">
    <tspan x="390" y="600">Connect with your fans deeply.</tspan>
    </text>
    
    <!-- Decorative Elements (Tags) -->
    <rect x="390" y="320" width="180" height="50" rx="25" fill="#1A1A1A"/>
    <text fill="#FFFFFF" xml:space="preserve" style="white-space: pre" font-family="Inter, sans-serif" font-size="18" font-weight="bold" letter-spacing="0.05em">
    <tspan x="424" y="352">Design System</tspan>
    </text>
    
    <rect x="590" y="320" width="140" height="50" rx="25" fill="#FDF0F5" stroke="#C2507A" stroke-width="2"/>
    <text fill="#C2507A" xml:space="preserve" style="white-space: pre" font-family="Inter, sans-serif" font-size="18" font-weight="bold" letter-spacing="0.05em">
    <tspan x="626" y="352">v1.2.0</tspan>
    </text>

    <!-- Filters -->
    <defs>
    <filter id="filter0_f_blur" x="800" y="-700" width="1200" height="1200" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
    <feGaussianBlur stdDeviation="150" result="effect1_foregroundBlur"/>
    </filter>
    <filter id="filter1_f_blur" x="-500" y="300" width="1400" height="1400" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
    <feGaussianBlur stdDeviation="150" result="effect1_foregroundBlur"/>
    </filter>
    </defs>
</svg>
```
