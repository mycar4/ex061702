# [SSOT] Google Stitch 디자인 시스템 명세서

본 문서는 `SmartShopper AI` 프로젝트의 전 영역(FO/BO)에 적용되는 디자인 토큰과 UI 컴포넌트 구현체 가이드라인입니다. 퍼블/개발 Gem은 본 명세의 토큰을 절대적으로 준수해야 합니다.

---

## 1. 전역 디자인 토큰 (Global Design Tokens)

### 가. 컬러 시스템 (Color Palette)
| 토큰명 | 색상 코드 (HEX) | 용도 |
| :--- | :--- | :--- |
| `--stitch-color-primary` | `#1E3A8A` | 메인 브랜드 컬러 (Deep Blue, 신뢰감 제공) |
| `--stitch-color-secondary` | `#10B981` | 서브 컬러 (Emerald Green, 가격 메리트 및 이득 표시) |
| `--stitch-color-accent` | `#EF4444` | 강조 컬러 (Red Orange, 핫딜, 마감 임박, 할인 정보) |
| `--stitch-bg-main` | `#FFFFFF` | 메인 기본 배경색 |
| `--stitch-bg-card` | `#F9FAFB` | 상품 피드 및 카드 컴포넌트 배경색 (Light Gray) |
| `--stitch-border-default` | `#E5E7EB` | 기본 분리선 및 테두리 컬러 |

### 나. 타이포그래피 (Typography)
- **Heading 1 (페이지 타이틀):** `font-size: 24px; font-weight: 700; line-height: 1.3;`
- **Heading 2 (상품명, 섹션 타이틀):** `font-size: 18px; font-weight: 600; line-height: 1.4;`
- **Body Text (리뷰, 리포트 본문):** `font-size: 14px; font-weight: 400; line-height: 1.6;`
- **Caption (할인율, 날짜):** `font-size: 12px; font-weight: 500; color: #6B7280;`

### 다. 간격 및 둥글기 (Spacing & Radius)
- **컴포넌트 내 패딩:** `padding: 16px (1rem)` 기본 지정
- **카드 컴포넌트 둥글기:** `border-radius: 12px`
- **검색 폼 / 버튼 둥글기:** `border-radius: 9999px` (Fully Rounded)

---

## 2. 핵심 UI 컴포넌트 명세

### 가. AI 검색 바 (AI Search Bar)
- **구조:** 인풋 필드 + 추천 아이콘 버튼
- **스타일:** `border: 2px solid var(--stitch-border-default)`, 포커스 시 `border-color: var(--stitch-color-primary)`로 확장.
- **둥글기:** 캡슐형(`9999px`) 구조 적용.

### 나. 상품 추천 카드 (Product Card)
- **구조:** 상품 이미지 + 상품명(H2) + 최저가/할인율 정보 + AI 리뷰 요약 배너
- **스타일:** 배경은 `var(--stitch-bg-card)`, 테두리는 `var(--stitch-border-default)`.
- **인터랙션:** 마우스 오버 시 `transform: translateY(-2px)`, 미세한 그림자 효과 추가.

### 다. AI 리뷰 뱃지 (Review Summary Badge)
- 긍정적인 요약 요소는 배경 `#E6F4EA`, 글자색 `#137333` 적용.
- 주의/부정적인 요약 요소는 배경 `#FCE8E6`, 글자색 `#C5221F` 적용.