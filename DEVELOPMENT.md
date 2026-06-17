# [SmartShopper AI] 시스템 개발 및 LangGraph RAG 파이프라인 명세서

## 1. 아키텍처 개요
- 백엔드 및 AI 로직은 `api/src/agents/` 구조 내에서 LangGraph 기반의 상태 중심 멀티 노드로 구현됩니다.
- 퍼블리셔가 생성한 `ui/` 컴포넌트를 `containers/` 영역으로 호출하여 실시간 데이터 및 액션 핸들러를 바인딩합니다.

## 2. LangGraph 파이프라인 설계 (State & Nodes)

### 가. 공유 상태 구조 (`state.ts`)
```typescript
export interface AgentState {
  userQuery: string;             // 유저 입력 ("100만원 이하 노트북 추천해줘")
  targetCategory: string;        // 파싱된 카테고리 ("노트북")
  budgetLimit: number;           // 파싱된 예산 한도 (1000000)
  scrapedRawData: any[];         // 실시간 수집된 상품 원본 배열
  filteredProducts: any[];       // 조건 필터링 및 임베딩 매칭 결과
  finalReport: string;           // LLM 이 최종 생성한 추천 마크다운 리포트
}
나. 4대 핵심 노드(Node) 단일 책임 원칙 (SRP)
Intent Analysis Node: 유저 쿼리를 분석하여 카테고리와 예산 제한을 분리 후 State에 기록.

Web Scraping Node: 설정된 카테고리 기반 실시간 이커머스 최저가 및 리뷰 본문 스크래핑 실행.

Vector Vectorize & Retrieval Node (RAG): 스크랩된 데이터를 임베딩하여 가상 벡터 공간에 적재 후 예산 범위 내 가성비 Top 5 데이터 정렬 추출.

LLM Summarization Node: Gemini 1.5 Pro를 통해 추출된 Top 5 중 최종 3개를 선정, 리뷰 장단점을 요약하여 finalReport에 바인딩 후 워크플로우 종료.

3. 글로벌 보안 가이드라인 준수 (Mandatory Compliance)
[Zod 입력 검증]: 유저의 검색어 입력단과 스크래핑된 가격 데이터 필드는 무조건 Zod 스키마를 통과해야 합니다. 길이 제한 및 타입 검증으로 인젝션을 방어합니다.

[WHATWG URL 표준]: 외부 쇼핑몰 구매 페이지로 넘어가는 아웃링크는 new URL(href) 파싱을 거쳐 http: 및 https: 프로토콜만 통과시키는 화이트리스트 필터를 구현합니다.

[DOMPurify 새니타이제이션]: LLM이 생성한 마크다운 리포트를 프론트엔드 React 19 환경에서 출력할 때, XSS 스크립트 주입 방지를 위해 사전에 DOMPurify.sanitize()를 강제 적용합니다.