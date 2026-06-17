import { AgentState } from '../state';

// Node 2: 스크랩 데이터 임베딩 및 벡터 DB 저장
export async function vectorizeNode(state: AgentState): Promise<Partial<AgentState>> {
  try {
    if (state.error) return {};

    console.log(`[VectorizeNode] ${state.products.length}개의 상품 데이터 임베딩 및 DB 인덱싱 시작`);

    // 외부 벡터 DB API 호출 및 임베딩 처리 시뮬레이션
    // try-catch 예외 처리 적용
    for (const product of state.products) {
      console.log(`[VectorizeNode] 인덱싱 진행 완료: ${product.name}`);
    }

    return {};
  } catch (error: any) {
    console.error("[VectorizeNode] 에러 발생:", error);
    return {
      error: `Vectorization failed: ${error.message || error}`,
    };
  }
}
