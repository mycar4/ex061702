# [SmartShopper AI] Google Stitch 기반 디자인 시스템 명세서

본 문서는 플랫폼의 아이덴티티와 UI 일관성을 유지하기 위한 Google Stitch 기반 디자인 토큰입니다. 모든 UI 구현물은 아래 토큰을 바인딩하여 구현되어야 합니다.

## 1. 전역 디자인 토큰 (Global Tokens)

### 가. 컬러 스키마 (Color Tokens)
```css
:root {
  --stitch-color-primary: #1E3A8A;       /* Deep Blue: 브랜드 신뢰감, 메인 테마 */
  --stitch-color-secondary: #10B981;     /* Emerald Green: 가격 비교, 할인율, 이득 표시 */
  --stitch-color-accent: #EF4444;        /* Red Orange: 핫딜, 마감임박, 긴급 경고 */
  
  --stitch-bg-main: #FFFFFF;             /* 메인 기본 배경색 */
  --stitch-bg-card: #F9FAFB;             /* 상품 피드 및 카드 배경 (Light Gray) */
  --stitch-bg-badge-positive: #E6F4EA;   /* 긍정 리뷰 배경 */
  --stitch-bg-badge-negative: #FCE8E6;   /* 부정 리뷰 배경 */
  
  --stitch-text-primary: #111827;        /* 주 텍스트 (Title) */
  --stitch-text-secondary: #4B5563;      /* 부 텍스트 (Body) */
  --stitch-border-default: #E5E7EB;      /* 컴포넌트 경계 및 라인 */
}

나. 타이포그래피 (Typography Scale)
H1 (Main Title): font-size: 24px; font-weight: 700; color: var(--stitch-text-primary);

H2 (Product Name): font-size: 18px; font-weight: 600; color: var(--stitch-text-primary);

Body (Report/Review): font-size: 14px; font-weight: 400; color: var(--stitch-text-secondary); line-height: 1.6;

Caption (Discount/Badge): font-size: 12px; font-weight: 500;

다. 간격 및 레이아웃 (Layout & Radius)
Card Corner Radius: border-radius: 12px;

Search Bar Radius: border-radius: 9999px; (캡슐형 구조)

Default Grid Spacing: gap: 16px (1rem);

2. 컴포넌트 UI 가이드라인
Search 컴포넌트: 활성화(Focus) 시 border: 2px solid var(--stitch-color-primary)로 확장 및 미세한 아우터 글로우 효과 부여.

Product Card 컴포넌트: Hover 시 transform: translateY(-4px) 이동 및 box-shadow 투포하여 입체감 제공.