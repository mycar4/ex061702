# [SSOT] SmartShopper AI 플랫폼 기획 명세서

## 1. 프로젝트 개요
- **서비스명:** SmartShopper AI (스마트쇼퍼 AI)
- **목적:** 유저의 자연어 요구사항을 분석하여 실시간 웹 스크래핑, 벡터 검색, RAG(검색 증강 생성) 기술을 통해 최적의 상품 정보 및 리뷰 요약을 제공하는 AI 기반 쇼핑 추천 플랫폼.
- **핵심 목표:** 정보 비대칭성을 해결하고, "100만원 이하 노트북 추천해줘"와 같은 의도 중심 질의에 초개인화된 리포트로 응답.

---

## 2. 주요 기능 요구사항 (Core Features)

### 가. 의도 기반 상품 검색 (Intent-Based Search)
- 유저가 입력한 자연어 문장(예: "100만원 이하 가성비 노트북")에서 가이드라인(예산, 카테고리, 목적)을 파악합니다.
- 추출된 키워드를 기반으로 1차 타겟 카테고리를 자동 맵핑합니다.

### 나. 실시간 가격 비교 (Real-time Price Comparison)
- 외부 커머스 및 가격 비교 사이트를 실시간 스크래핑하여 최저가 정보를 수집합니다.
- 배송비, 추가 옵션을 포함한 '실제 구매가' 기준으로 정렬 스키마를 구성합니다.

### 다. 실시간 할인 정보 제공 (Live Discount Tracking)
- 카드사 할인, 쿠폰 적용가, 타임 딜 등 숨겨진 추가 혜택 데이터를 파싱합니다.
- 최종 추천 단계에서 할인율과 최종 혜택가를 명확히 노출합니다.

### 라. LLM 기반 리뷰 요약 (AI Review Summarization)
- 해당 상품의 최신 리뷰 데이터를 최소 50건 이상 수집하여 LLM 피드로 주입합니다.
- 광고성 리뷰를 필터링하고, 실제 구매자의 [장점], [단점], [한 줄 평]을 3줄 요약 형태로 도출합니다.

### 마. RAG 기반 구매 추천 리포트 (RAG Recommendation Report)
- 벡터 DB 내의 상품 메타데이터와 실시간 스크랩된 동적 데이터를 하이브리드 검색(Hybrid Search)합니다.
- 가성비 평점 스코어링 알고리즘을 거쳐 유저에게 가장 적합한 Top 3 상품 추천 리포트를 생성합니다.

---

## 3. 기술 요구사항 & 제약 조건 (Technical Requirements)

### 가. 에이전트 아키텍처 (LangGraph)
- **Single Responsibility Node:** 스크래핑, 임베딩, 검색, 요약 노드는 철저히 독립된 노드로 분리합니다.
- **State Flow:** `UserQuery` ➔ `ScrapeData` ➔ `VectorMatches` ➔ `FinalReport` 상태 파이프라인을 유지합니다.

### 나. 보안 Baseline (Global Policy 연계)
- **입력 검증:** 유저 쿼리 및 가격 파싱 단계에서 `Zod` 스키마를 사용하여 인젝션 및 데이터 오염을 차단합니다.
- **XSS 필터링:** 렌더링 시 `dangerouslySetInnerHTML` 사용을 금지하며, 마크다운 리포트 출력 시 `DOMPurify` 새니타이제이션을 필터로 강제합니다.
- **URL 표준:** 외부 쇼핑몰 아웃링크 이동 시 `WHATWG URL` 표준을 준수하여 `http:` 및 `https:` 프로토콜만 화이트리스트로 허용합니다.

### 다. 개발 환경
- 프론트엔드는 최신 React 19+ 기반 Hook 패턴 및 스트리밍 응답 렌더링을 지원합니다.


### 라. 인프라 아키텍처 및 배포 환경 (Infrastructure & Deployment)
- **Front Office (FO):** Vercel 배포 (React 19, Vite 기반 정적 호스팅 및 자동 CI/CD 적용)
- **Backend API (API):** Render.com 배포 (Node.js Web Service 컨테이너, TypeScript 런타임)
- **통신 보안:** 프론트엔드와 백엔드는 HTTPS 기반으로 통신하며, API 주소는 하드코딩을 배제하고 환경 변수(`VITE_API_URL`)를 통해 런타임에 동적으로 주입됩니다.