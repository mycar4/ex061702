# Walkthrough: React FO Design Parity & Markdown Formatting Fixes

이전 React FO 전환 과정에서 확인된 디자인 불일치 및 스트리밍 마크다운 렌더링 문제를 성공적으로 해결하고 검증을 진행했습니다.

## 주요 변경 사항

### 1. 디자인 시스템 토큰 및 아이콘 수정 ([index.css](file:///c:/00_Ai%20%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8/0_Anti/ex061702/smart-shopper-agent/fo/src/index.css))
* **Material Symbols Outlined 아이콘 폰트 바인딩 강화:**
  * 클래스 선택자 `.material-symbols-outlined`에 `font-family`를 직접 설정하여 폰트 로드 타이밍이나 상속 과정에서 아이콘 명이 일반 텍스트(예: "notifications")로 노출되던 결함을 완벽히 해결했습니다.
* **디자인 토큰 타이포그래피 클래스 추가:**
  * `DESIGN.md` 가이드라인을 준수하기 위해 `text-body-sm`, `text-label-caps`, `text-display-lg`, `text-body-md`, `text-headline-md`, `text-price-lg`, `text-display-lg-mobile` 등 각 타이포그래피에 대해 `font-size`, `line-height`, `font-weight`, `letter-spacing`, `text-transform`을 CSS 클래스로 명시적으로 선언했습니다. 이를 통해 폰트 비율과 배치가 정적 HTML과 100% 동일하게 복원되었습니다.

### 2. 상단 네비게이션 헤더 개선 ([TopAppBar.tsx](file:///c:/00_Ai%20%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8/0_Anti/ex061702/smart-shopper-agent/fo/src/components/TopAppBar.tsx))
* **홈 화면 헤더의 검색창 격리:**
  * React Router의 `useLocation`을 사용하여 헤더 내 검색창이 결과 페이지(`/search`)에서만 노출되도록 조건부 렌더링을 적용했습니다.
* **메뉴 폰트 크기 및 디자인 일치:**
  * 상단 네비게이션 링크 텍스트의 폰트 스타일을 Stitch 디자인 가이드에 맞게 `font-label-caps text-label-caps`로 수정하여 지나치게 큰 글씨로 균형이 깨지던 레이아웃을 조절했습니다.
* **로그인 버튼 텍스트 제거:**
  * 프로필 아이콘 오른쪽의 불필요한 "로그인" 한글 텍스트를 제거하고 아이콘만 단독으로 렌더링되게 수정했습니다.

### 3. 실시간 AI 추천 리포트 렌더링 개선 ([SearchResultPage.tsx](file:///c:/00_Ai%20%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8/0_Anti/ex061702/smart-shopper-agent/fo/src/pages/SearchResultPage.tsx))
* **강인한 라인별 마크다운 파서 구현:**
  * 정규식 기반 단순 문자열 치환 파서의 한계를 극복하기 위해 `\n` 기준으로 라인을 먼저 분할한 후 헤더(`###`, `####`, `##`), 목록 구분선(`- `, `* `), 개행(빈 줄) 등을 순차적으로 정제하는 로직으로 변경했습니다.
  * `dangerouslySetInnerHTML`로 주입되는 원본 HTML에 클래스를 정상 인지하도록 `className` 대신 `class` 특성을 사용하였으며, DOMPurify 보안 화이트리스트 검증을 유지하여 악성 스크립트 실행(XSS)을 사전에 안전하게 차단했습니다.
  * 이를 통해 `#`, `**`, `---`와 같은 마크다운 문장 부호들이 더 이상 사용자 화면에 날것으로 노출되지 않고 깨끗하게 스타일링된 텍스트로 보입니다.

### 4. "12개 쇼핑 채널" 문구 및 아웃링크 인증 차단 해결 ([SearchResultPage.tsx](file:///c:/00_Ai%20%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8/0_Anti/ex061702/smart-shopper-agent/fo/src/pages/SearchResultPage.tsx), [search_result_ko.html](file:///c:/00_Ai%20%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8/0_Anti/ex061702/smart-shopper-agent/designs/search_result_ko.html), [scrape.ts](file:///c:/00_Ai%20%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8/0_Anti/ex061702/smart-shopper-agent/api/src/agents/nodes/scrape.ts))
* **"12개 쇼핑 채널" 문구 제거 및 다변화**:
  * 에이전트 실시간 분석 화면 및 결과 리포트 서브타이틀 내 "12개 쇼핑 채널", "12개 주요 판매처" 등의 정적 문구를 모두 제거하고 "주요 쇼핑몰 (쿠팡, 네이버쇼핑 등)"으로 일반화하여 실제 실시간 검색 채널과 정확히 부합하게 변경했습니다.
* **네이버 쇼핑 "인증 페이지 (device_prevent.nhn)" 우회 및 보안 강화**:
  * 로컬 개발 서버(`localhost`)의 리퍼러 헤더 유출로 인해 네이버 쇼핑 아웃링크 이동 시 발생하는 로봇 인증 페이지 차단 문제를 해결했습니다.
  * 리액트 및 정적 HTML의 바로구매 링크(`<a>`) 전체에 `rel="noopener noreferrer"`와 `referrerpolicy="no-referrer"` 속성을 전면 적용하여 브라우저의 Referer 정보 유출을 완벽하게 차단했습니다.
  * 라이브 API 스크레이핑 노드(`scrape.ts`)의 fallback 링크 생성 로직 역시 데스크톱 대신 상대적으로 보안 규제가 유연한 모바일 도메인(`msearch.shopping.naver.com`) 검색 URL을 우선 사용하도록 수정했습니다.
* **마크다운 링크의 새 창 열기 및 DOMPurify 속성 유지**:
  * 실시간 AI 추천 리포트 본문 내에 생성되는 `[공식 구매 페이지 바로가기]` 등의 마크다운 링크가 기존 `DOMPurify.sanitize()` 기본 정책에 의해 `target="_blank"`, `rel`, `referrerpolicy` 등의 속성이 강제로 제거되어 현재 창에서 열리는 현상을 규명했습니다.
  * [SearchResultPage.tsx](file:///c:/00_Ai%20%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8/0_Anti/ex061702/smart-shopper-agent/fo/src/pages/SearchResultPage.tsx)의 `DOMPurify.sanitize()` 옵션에 `ADD_ATTR: ['target', 'rel', 'referrerpolicy']` 설정을 추가하여 마크다운 링크 또한 성공적으로 새 창에서 안전하게 열리도록 구성했습니다.

## 검증 결과

* **빌드 검증:** `fo` 폴더 내 TypeScript 타입 에러 체크(`tsc --noEmit`) 결과 오류 없이 컴파일을 통과했습니다.
* **화면 렌더링 확인 (Browser Subagent):**
  * 홈 화면에서 헤더의 로그인 글씨가 사라졌으며, 아이콘들이 텍스트가 아닌 실제 그래픽 심볼로 표기됩니다.
  * 노트북(노트북) 검색 시 `/api/recommend/stream` API에서 전송받은 실제 크롤링 제품 정보(예: `MacBook Pro 14 (M3 Max, 36GB RAM, 1TB SSD)`, `Dell XPS 17`)가 화면 카드 레이아웃에 정상 매핑되며, 마크다운 추천 리포트가 깔끔하게 파싱되어 노출됨을 스크린샷으로 확인했습니다.
  * "바로구매" 링크 및 리포트 본문의 **"공식 구매 페이지 바로가기" 링크 클릭 시 모두 기존 검색 결과 화면을 유지한 채 새 탭에서 상품 링크가 열리며**, 로봇 차단 페이지도 성공적으로 회피함을 확인했습니다.

### 📸 브라우저 검증 비디오 기록
![Browser Verification WebP Recording](/C:/Users/kosa/.gemini/antigravity-ide/brain/99a02618-bff7-43b4-8000-8b4ca3053a7d/verify_link_target_1781759274150.webp)
