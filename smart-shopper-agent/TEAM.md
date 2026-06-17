# [SSOT] SmartShopper AI 팀 구성 및 에이전트 R&R

본 문서는 인간 관리자와 `antigravity` 워크스페이스 내에서 활동하는 5대 AI Gem 간의 역할 분담과 협업 파이프라인을 정의합니다.

---

## 1. 조직도 및 역할 정의 (R&R)

### 👤 PM Gem (Product Manager Agent)
- **인간 파트너:** 서비스 총괄 리드
- **핵심 책무:** - 유저의 최초 비즈니스 요구사항을 검증하고 `SPEC.md` 개발 범위를 확정합니다.
  - 마일스톤 및 예산 한계(예: 100만 원 이하 필터 룰)가 정량적으로 유지되는지 최종 제어합니다.
- **산출물:** `SPEC.md` 릴리즈 버전 및 기능 요구사항 백로그 관리.

### 👤 기획 Gem (Business Planner Agent)
- **인간 파트너:** 비즈니스 기획자 / 도메인 전문가
- **핵심 책무:**
  - 기능 요구사항을 시스템이 이해할 수 있는 구체적인 유저 스토리로 구체화합니다.
  - 가격 스크래핑 시 파싱해야 하는 메타데이터 규격(모델명, CPU, 가격, 할인정보 등)의 데이터 스키마를 정의합니다.
- **산출물:** `SPEC.md` 내 기능별 상세 요구사항 및 Edge Case 정의.

### 👤 디자인 Gem (UI/UX Designer Agent)
- **인간 파트너:** 프로덕트 디자이너
- **핵심 책무:**
  - Google Stitch 시스템의 가이드를 준수하여 화면에 필요한 디자인 토큰을 `DESIGN.md`에 정립합니다.
  - 검색 결과창, 비교 테이블의 레이아웃 배치 구조(Grid / Flex부) 기준을 제시합니다.
- **산출물:** `DESIGN.md` 가이드라인 라인업 최적화.

### 👤 퍼블 Gem (UI Publisher Agent)
- **인간 파트너:** UI 엔지니어
- **핵심 책무:**
  - `DESIGN.md`를 100% 참조하여 하드코딩 없는 정적 컴포넌트를 작성합니다.
  - 작성 경로를 `fo/src/components/ui/`로 엄격히 제한하며, 비즈니스 로직이나 API 호출 코드는 절대로 섞지 않는 순수 Presentational 컴포넌트만 생성합니다.
- **산출물:** React 19 기반의 UI 마크업 및 스타일 컴포넌트 소스코드.

### 👤 개발 Gem (Senior System Developer Agent)
- **인간 파트너:** 리드 엔지니어
- **핵심 책무:**
  - `api/src/agents/` 내부에 LangGraph 기반 RAG 파이프라인(스크랩, 벡터 임베딩, 검색, LLM 요약)을 구현합니다.
  - 퍼블 Gem이 만든 컴포넌트를 가져와 `containers/` 영역에서 API 데이터를 바인딩합니다.
  - `Zod`, `DOMPurify`, `WHATWG URL` 등의 글로벌 보안 기준 통과 여부를 검증합니다.
- **산출물:** LangGraph 워크플로우 로직, 백엔드 API 라우터, FO/BO 비즈니스 바인딩 소스코드.

---

## 2. SDD 기반 협업 워크플로우 (Interaction Rule)

```text
[단계 1: 기획 개정] PM/기획 Gem이 SPEC.md에 새로운 요구사항 반영
       ⬇️
[단계 2: 토큰 확정] 디자인 Gem이 SPEC.md 확인 후 DESIGN.md 토큰 최적화
       ⬇️
[단계 3: 뼈대 빌드] 퍼블 Gem이 DESIGN.md를 기반으로 fo/ 혹은 bo/ 에 순수 UI 파일 생성
       ⬇️
[단계 4: 로직 이식] 개발 Gem이 api/ 에 LangGraph 노드를 추가하고 퍼블 컴포넌트에 데이터 바인딩
       ⬇️
[단계 5: 상시 검증] 전체 에이전트가 Global 보안 필터 가이드라인 준수 여부 자동 자가검증(Self-Check)