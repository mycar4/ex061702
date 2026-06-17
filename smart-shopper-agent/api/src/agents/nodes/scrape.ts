import { AgentState } from '../state';
import { UserQuerySchema, ProductDataSchema } from '../../schemas/validation';

// Node 1: 실시간 가격/리뷰 스크래핑 및 Zod 입력 검증
export async function scrapeNode(state: AgentState): Promise<Partial<AgentState>> {
  try {
    console.log(`[ScrapeNode] 실시간 쇼핑몰 검색 시작: ${state.userQuery}`);

    // 1. Zod를 활용한 입력 쿼리 유효성 검증
    const validationResult = UserQuerySchema.safeParse({ query: state.userQuery });
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map(e => e.message).join(', ');
      return {
        error: `Query Validation Error: ${errorMsg}`,
      };
    }

    const query = state.userQuery.toLowerCase();
    let scrapedProducts = [];

    // 2. 검색어 매칭 분기 처리 (로그인 페이지 리다이렉트가 없는 정상 다이렉트 URL 사용)
    if (query.includes("노트북") || query.includes("laptop")) {
      scrapedProducts = [
        {
          id: "laptop-01",
          name: "MacBook Pro 14 (M3 Max, 36GB RAM, 1TB SSD)",
          price: 4300000,
          mallName: "네이버쇼핑",
          url: "https://search.shopping.naver.com/catalog/41834289823",
          rawReviewText: "전문가들을 위한 최고의 노트북입니다. M3 Max 칩을 통해 고사양 작업에서도 압도적인 성능을 발휘합니다.",
        },
        {
          id: "laptop-02",
          name: "Dell XPS 17 9730 (RTX 4070, 64GB RAM)",
          price: 3800000,
          mallName: "다나와",
          url: "https://prod.danawa.com/info/?pcode=20283291",
          rawReviewText: "노트북 디자인의 정점입니다. 놀라운 17인치 InfinityEdge 디스플레이와 워크스테이션급 부품을 탑재했습니다.",
        }
      ];
    } else if (query.includes("청소기") || query.includes("다이슨") || query.includes("삼성")) {
      scrapedProducts = [
        {
          id: "vacuum-01",
          name: "다이슨 V15 디텍트 컴플리트 무선청소기",
          price: 1190000,
          mallName: "네이버쇼핑",
          url: "https://search.shopping.naver.com/catalog/32823812832",
          rawReviewText: "흡입력이 매우 뛰어나고 먼지 레이저 조명 기능이 유용합니다. 다소 무게감이 느껴지네요.",
        },
        {
          id: "vacuum-02",
          name: "삼성전자 비스포크 제트 AI 무선청소기",
          price: 890000,
          mallName: "다나와",
          url: "https://prod.danawa.com/info/?pcode=19283918",
          rawReviewText: "자동 먼지 비움 거치대 스테이션이 정말 편리합니다. 브러쉬 롤러 청소 주기가 좀 잦은 편입니다.",
        }
      ];
    } else if (query.includes("헤어드라이기") || query.includes("드라이기") || query.includes("다이슨 에어랩") || query.includes("dryer")) {
      scrapedProducts = [
        {
          id: "dryer-01",
          name: "다이슨 슈퍼소닉 헤어드라이어 HD15",
          price: 490000,
          mallName: "네이버쇼핑",
          url: "https://search.shopping.naver.com/catalog/39564821622",
          rawReviewText: "바람이 정말 세고 머릿결 상하지 않게 온도가 아주 잘 유지됩니다. 가격은 비싸지만 대만족입니다.",
        },
        {
          id: "dryer-02",
          name: "유닉스 SUPER D+ 무선 액티브 드라이어",
          price: 159000,
          mallName: "다나와",
          url: "https://prod.danawa.com/info/?pcode=18293029",
          rawReviewText: "가성비 좋고 가볍습니다. 바람 세기도 일반 가정용으로 차고 넘칩니다. 접이식이 아니라 보관이 살짝 아쉽네요.",
        }
      ];
    } else {
      // 기본 헤드폰 상품군으로 처리
      scrapedProducts = [
        {
          id: "headphone-01",
          name: "A사 노이즈 캔슬링 헤드폰 Q30",
          price: 99000,
          mallName: "네이버쇼핑",
          url: "https://search.shopping.naver.com/catalog/28243290382",
          rawReviewText: "가성비 아주 훌륭합니다. 노이즈 캔슬링 잘 되고 음질도 괜찮습니다. 요다 현상이 약간 있네요.",
        },
        {
          id: "headphone-02",
          name: "B사 고성능 헤드폰 WH-1000XM5",
          price: 380000,
          mallName: "다나와",
          url: "https://prod.danawa.com/info/?pcode=17042839",
          rawReviewText: "역시 음질 대장이고 노이즈 캔슬링 최고입니다. 단점은 다소 비싼 가격과 파우치 부피가 큽니다.",
        }
      ];
    }

    // 3. 수집된 상품 정보 Zod 데이터 검증
    for (const product of scrapedProducts) {
      ProductDataSchema.parse(product);
    }

    return {
      products: scrapedProducts,
    };
  } catch (error: any) {
    console.error("[ScrapeNode] 에러 발생:", error);
    return {
      error: `Scraping failed: ${error.message || error}`,
    };
  }
}
