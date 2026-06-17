import { AgentState } from '../state';

// Node 4: LLM 기반 리뷰 요약 및 최종 추천서 작성
export async function summarizerNode(state: AgentState): Promise<Partial<AgentState>> {
  try {
    if (state.error) return {};

    console.log("[SummarizerNode] LLM 추천 리포트 빌드 시작");

    if (state.retrievedProducts.length === 0) {
      return {
        report: "조건에 부합하는 추천 상품 정보를 찾지 못했습니다.",
      };
    }

    // LLM API 호출 및 분석서 작성 시뮬레이션
    let reportMarkdown = `### 🌟 Smart Shopper 쇼핑 추천 리포트\n\n`;
    state.retrievedProducts.forEach((product) => {
      reportMarkdown += `#### [${product.name}] (${product.mallName})\n`;
      reportMarkdown += `- **가격**: ${product.price.toLocaleString()}원\n`;
      reportMarkdown += `- **리뷰 핵심 요약**: ${product.rawReviewText || "리뷰 정보 없음"}\n`;
      reportMarkdown += `- **바로가기**: [구매 링크](${product.url})\n\n`;
    });

    return {
      report: reportMarkdown,
    };
  } catch (error: any) {
    console.error("[SummarizerNode] 에러 발생:", error);
    return {
      error: `Summarization failed: ${error.message || error}`,
    };
  }
}
