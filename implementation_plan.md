# React 기반 Front Office (FO) 전환 계획

현재 디자인된 정적 HTML 파일들(`designs/main_home_ko.html`, `designs/search_result_ko.html`)을 최신 React 프레임워크(Vite + React 19 + TypeScript + TailwindCSS) 기반의 동적 SPA(Single Page Application)로 전면 마이그레이션하는 계획입니다. 

HTML 파일의 단순 자바스크립트를 넘어, React의 상태 관리(State)를 통해 검색 결과와 AI 추천 리포트가 화면 깜빡임 없이(Seamless) 동적으로 렌더링되도록 개선합니다.

> [!NOTE]
> 브라우저 캐시 문제나 DOM 업데이트 한계로 인해 발생했던 "검색어가 반영되지 않는 현상"이나 "고정값 노출 현상"이 React로 전환되면 완벽하게 해결되며, 사용자 경험(UX)이 한층 업그레이드됩니다.

## User Review Required

> [!IMPORTANT]
> 기존 `fo` 폴더 내에 아주 기본적인 파일(`package.json`, `SearchPage.tsx` 등)이 일부 존재하지만, 아키텍처를 제대로 구성하기 위해 **Vite 빌드 툴을 사용하여 `fo` 폴더를 새로운 React 프로젝트로 덮어쓰기/초기화**하고자 합니다. 기존 구조를 유지해야 하는 제약 사항이 있는지 확인 부탁드립니다. (없으시다면 바로 덮어쓰고 진행하겠습니다.)

## Open Questions

1. **개발 서버 구동 방식**: React(FO) 서버를 `http://localhost:5173` 등 별도의 포트로 구동하여 백엔드(`http://localhost:3001`)와 통신하게 하는 분리형 아키텍처를 선호하시나요, 아니면 빌드(Build) 후 백엔드 Express 서버에서 한 번에 서빙하게 하는 통합형을 선호하시나요? (현재 개발 단계에서는 분리형이 효율적입니다.)

## Proposed Changes

---

### Frontend Framework Setup

*   **Vite + React + TS 환경 구성**: `fo` 디렉토리에 Vite 프로젝트 초기화.
*   **TailwindCSS 설정**: 현재 HTML에 인라인으로 삽입된 Tailwind 설정 및 토큰(primary, secondary 등 DESIGN.md 규칙)을 `tailwind.config.js`에 이관.
*   **라우팅(React Router)**: `/` (메인 홈), `/search` (검색 결과) 라우팅 설정.

#### [NEW] fo/package.json
- Vite, React, React Router, TailwindCSS 패키지 의존성 재정의.

#### [NEW] fo/tailwind.config.js
- ShopWise AI의 커스텀 테마 색상(surface, primary-container 등) 추가.

---

### UI Components Migration

HTML로 짜인 UI 요소들을 모듈화된 React 컴포넌트로 분리합니다.

#### [NEW] fo/src/components/TopAppBar.tsx
- 메인 홈과 검색 결과 페이지에서 공통으로 사용되는 상단 네비게이션 바.

#### [NEW] fo/src/components/ProductCard.tsx
- 개별 상품을 보여주는 컴포넌트 (가격, 이미지, 최저가 동적 바인딩).

#### [NEW] fo/src/components/SidebarFilter.tsx
- 카테고리/브랜드 필터 및 가격 변동 폭 슬라이더. 검색어에 따라 동적으로 상태를 변화시킴.

---

### Pages Integration & Backend API (SSE) Connection

정적 페이지를 React 기반으로 재작성하며 상태(State) 로직을 연동합니다.

#### [MODIFY] fo/src/pages/HomePage.tsx
- 기존 `main_home_ko.html`의 Hero 섹션과 Bento Grid UI 적용.
- 검색 Input에서 엔터 입력 시 `/search?q=검색어` 로 라우팅.

#### [MODIFY] fo/src/pages/SearchResultPage.tsx
- 기존 `search_result_ko.html` 화면 구성 적용.
- `useEffect` 훅에서 백엔드 `/api/recommend/stream` API(EventSource) 호출.
- 스트리밍되는 AI 리포트 조각들을 React 상태(`reportContent`)에 누적하여 렌더링.
- 스트리밍되는 추천 상품 배열을 React 상태(`products`)에 업데이트하여 `ProductCard`로 매핑 렌더링.

## Verification Plan

### Automated Tests
- `npm run build` 스크립트를 통해 React 빌드 오류가 없는지 검증.
- `npx tsc --noEmit`을 통한 타입 에러 점검.

### Manual Verification
1. `npm run dev`로 React 서버 가동 후 `http://localhost:5173` 접속.
2. 메인 페이지에서 검색어 입력 시 결과 페이지로 부드럽게 화면 이동 확인.
3. 결과 페이지에서 브라우저 캐시 문제 없이 곧바로 AI 스트리밍 리포트가 애니메이션되며 작성되는지 확인.
4. 백엔드에서 전송하는 동적 모의 데이터(제품 이름, 설명 등)가 정확히 화면에 매핑되는지 확인.
