import { AgentState } from '../state';

// Node 3: 유저 쿼리에 맞는 Top-N 유사 상품 추출 (RAG)
export async function retrieverNode(state: AgentState): Promise<Partial<AgentState>> {
  try {
    if (state.error) return {};

    console.log(`[RetrieverNode] 사용자 쿼리 '${state.userQuery}' 기준 유사 상품 추출`);

    // Vector DB에서 유사도 기반 top-N 검색 수행 시뮬레이션
    let retrieved = state.products.filter(p => 
      p.name.toLowerCase().includes(state.userQuery.toLowerCase()) || 
      p.rawReviewText?.toLowerCase().includes(state.userQuery.toLowerCase())
    );

    // 일치하는 항목이 없을 경우, 스크랩된 모든 제품을 대상으로 설정
    if (retrieved.length === 0) {
      retrieved = state.products;
    }

    return {
      retrievedProducts: retrieved,
    };
  } catch (error: any) {
    console.error("[RetrieverNode] 에러 발생:", error);
    return {
      error: `Retrieval failed: ${error.message || error}`,
    };
  }
}
