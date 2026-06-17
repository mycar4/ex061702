import { AgentState } from '../state';

// Node 1: 실시간 가격/리뷰 스크래핑
export async function scrapeNode(state: AgentState): Promise<Partial<AgentState>> {
  try {
    console.log(`[ScrapeNode] 실시간 쇼핑몰 검색 시작: ${state.userQuery}`);

    // 외부 크롤링/스크래핑 API 호출 가정 (네이버/다나와 등)
    // 실제 API 호출 시 예외 처리 적용
    const scrapedProducts = [
      {
        id: "p1",
        name: "A사 노이즈 캔슬링 헤드폰 Q30",
        price: 99000,
        mallName: "네이버쇼핑",
        url: "https://search.shopping.naver.com/catalog/q30",
        rawReviewText: "가성비 아주 훌륭합니다. 노이즈 캔슬링 잘 되고 음질도 괜찮습니다. 요다 현상이 약간 있네요.",
      },
      {
        id: "p2",
        name: "B사 고성능 헤드폰 WH-1000XM5",
        price: 380000,
        mallName: "다나와",
        url: "https://prod.danawa.com/info/?pcode=xm5",
        rawReviewText: "역시 음질 대장이고 노이즈 캔슬링 최고입니다. 단점은 다소 비싼 가격과 파우치 부피가 큽니다.",
      }
    ];

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
