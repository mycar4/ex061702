# [SmartShopper AI] UI 퍼블리셔 가이드 및 정적 컴포넌트 규칙

본 문서는 `SmartShopper AI` 플랫폼의 UI/UX 일관성을 유지하고, 개발 파트와의 원활한 협업을 위해 UI 퍼블리셔가 준수해야 할 정적 컴포넌트 작성 규칙 및 인터페이스 명세입니다.

---

## 1. 퍼블리싱 기본 원칙

- **작업 경로 제한:** 모든 정적 UI 코드는 반드시 `fo/src/components/ui/` 또는 `bo/src/components/ui/` 내에 위치해야 합니다. 타 파트의 폴더 영역을 침범하지 않습니다.
- **로직 격리 (Presentational Component):** 생성하는 모든 컴포넌트는 비즈니스 로직을 포함하지 않는 순수 마크업 및 스타일 뼈대여야 합니다. `useEffect`, API fetch 호출, 상태값 변경(`useState`) 등의 데이터 흐름 로직 작성을 엄격히 금지합니다.
- **토큰 준수 강제:** CSS 및 인라인 스타일 작성 시 하드코딩된 색상 코드(예: `#1E3A8A`)의 사용을 절대 금지합니다. 반드시 `DESIGN_SYSTEM.md`에 선언된 디자인 시스템 전역 CSS 변수(`var(--stitch-*)`)를 활용하여 스타일을 바인딩해야 합니다.

---

## 2. 핵심 UI 컴포넌트 Props 인터페이스 명세 (TypeScript)

모든 UI 컴포넌트는 개발 파트에서 데이터를 바인딩할 수 있도록 아래 정의된 TypeScript Interface 규격을 정확히 구현해야 합니다.

### 가. AI 검색 바 (`SearchBar.tsx`)
사용자의 자연어 쿼리를 입력받아 컨테이너 레이어로 이벤트를 전달하는 캡슐형 검색 컴포넌트입니다.

```typescript
import React from 'react';

export interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: () => void;
  isLoading: boolean;
}