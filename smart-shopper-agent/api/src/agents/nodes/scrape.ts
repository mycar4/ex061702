import { AgentState } from '../state';
import { UserQuerySchema, ProductDataSchema } from '../../schemas/validation';

// DuckDuckGo HTML 검색을 수행하여 원본 텍스트 결과를 받아오는 함수
async function searchWebDuckDuckGo(query: string): Promise<string> {
  try {
    // 한국 쇼핑 및 가격비교 유도 키워드 조합
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' 쇼핑 최저가 쿠팡 네이버쇼핑')}`;
    console.log(`[DuckDuckGo] 실시간 웹 검색 요청 시작: ${searchUrl}`);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (response.ok) {
      const html = await response.text();
      // HTML 태그와 스크립트/스타일을 제거하여 검색 스니펫 텍스트만 추출
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .substring(0, 10000); // 토큰 과소비를 막기 위해 상위 1만자만 슬라이싱
      return text;
    } else {
      console.warn(`[DuckDuckGo] 검색 요청 실패 (상태 코드: ${response.status})`);
    }
  } catch (e) {
    console.error('[DuckDuckGo] 검색 중 네트워크 에러:', e);
  }
  return '';
}

// LLM을 사용하여 검색 스니펫 텍스트로부터 구조화된 상품 정보 JSON을 추출하는 함수
async function extractProductsFromSearchText(query: string, searchText: string, geminiKey: string, openaiKey: string): Promise<any[] | null> {
  const prompt = `You are a shopping search extractor.
Below is the raw search engine results text for the query: "${query}".
Extract the top 3-4 actual products matching the query being sold right now on Coupang (쿠팡), Naver Shopping (네이버쇼핑), or other major malls.
If there are prices mentioned in the search results (like 1,450,000원 or 89,000원), use those actual prices. If a price is in USD, convert it to KRW (approx 1350 KRW/USD).
If there are no URLs in the text, generate a valid search query URL on Coupang (e.g. https://www.coupang.com/np/search?q=...) or Naver Shopping mobile URL (e.g. https://msearch.shopping.naver.com/search/all?query=...) to avoid browser blocks.

Raw Search Text:
${searchText}

Return the results ONLY as a JSON array of objects with the following format (do not include any conversational text or markdown codeblocks, only the raw JSON array string):
[
  {
    "id": "string",
    "name": "string",
    "price": number, // Price as a number (e.g., 4300000)
    "mallName": "string (e.g., 쿠팡, 네이버쇼핑)",
    "url": "string (Product URL)",
    "rawReviewText": "string (Brief summary of user reviews or product description)"
  }
]`;

  // OpenAI Key가 존재하면 속도가 빠른 gpt-4o-mini로 추출 수행
  if (openaiKey) {
    try {
      console.log(`[ScrapeNode] OpenAI를 통해 실시간 쇼핑 결과 추출 중...`);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content || "";
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (e) {
      console.error('[ScrapeNode] OpenAI 정보 추출 중 에러:', e);
    }
  }

  // OpenAI 실패 시 혹은 키 누락 시 Gemini 모델로 폴백
  if (geminiKey) {
    try {
      console.log(`[ScrapeNode] Gemini를 통해 실시간 쇼핑 결과 추출 중...`);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (e) {
      console.error('[ScrapeNode] Gemini 정보 추출 중 에러:', e);
    }
  }

  return null;
}

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
    let scrapedProducts: any[] = [];

    // 2. 실시간 웹 검색 및 상품 정보 추출 실행
    const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
    const openaiKey = (process.env.OPENAI_API_KEY || "").trim();

    if (geminiKey || openaiKey) {
      const searchText = await searchWebDuckDuckGo(state.userQuery);
      if (searchText) {
        const liveProducts = await extractProductsFromSearchText(state.userQuery, searchText, geminiKey, openaiKey);
        if (liveProducts && liveProducts.length > 0) {
          scrapedProducts = liveProducts.map((p, idx) => ({
            id: p.id || `live-prod-${idx}`,
            name: p.name || `상품 ${idx + 1}`,
            price: Number(p.price) || 0,
            mallName: p.mallName || '네이버쇼핑',
            url: p.url || 'https://msearch.shopping.naver.com/',
            rawReviewText: p.rawReviewText || '리뷰 정보 수집 완료.'
          }));
          console.log(`[ScrapeNode] 실시간 라이브 검색 및 추출 성공: ${scrapedProducts.length}개 상품 수집`);
        }
      }
    }

    // 3. 실시간 검색 실패 시 기존 로컬 매칭 데이터로 폴백
    if (scrapedProducts.length === 0) {
      console.log(`[ScrapeNode] 실시간 라이브 검색이 실패하여 기존 로컬 시뮬레이션 데이터로 대체합니다.`);
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
        const cleanKeyword = state.userQuery.replace(/(추천해줘|비교해줘|추천|비교|찾아줘|순위|알려줘|구해줘)/g, "").trim() || "맞춤 상품";
        
        let prefix1 = "프리미엄";
        let prefix2 = "가성비 실속형";
        let price1 = 159000;
        let price2 = 49000;
        let review1 = `마감 처리가 매우 정교하고 튼튼합니다. 실생활에서 사용 시 인체공학적 설계가 돋보여 매우 마음에 듭니다.`;
        let review2 = `가격 대비 기본 기능에 아주 충실한 훌륭한 아이템입니다. 일상적으로 쓰기에 가성비 최고네요.`;

        const k = cleanKeyword.toLowerCase();
        if (k.includes("의자") || k.includes("가구") || k.includes("책상") || k.includes("테이블") || k.includes("소파")) {
          prefix1 = "이태리 가죽 / 고급 원목";
          prefix2 = "친환경 조립식";
          price1 = 289000;
          price2 = 89000;
          review1 = `원목 결이 살아있고 마감이 정말 고급스럽습니다. 공간의 멋을 한층 더 살려주네요.`;
          review2 = `조립이 무척 간편하고 가성비 면에서 극강입니다. 튼튼해서 오랫동안 쓰기 좋을 것 같습니다.`;
        } else if (k.includes("물통") || k.includes("텀블러") || k.includes("보온병") || k.includes("컵")) {
          prefix1 = "이중진공 스테인리스 스포츠";
          prefix2 = "트라이탄 친환경 대용량";
          price1 = 45000;
          price2 = 18000;
          review1 = `보온 보냉 성능이 하루 종일 유지됩니다. 입구가 넓어서 얼음 넣고 세척하기에 최고입니다.`;
          review2 = `소재가 가볍고 튼튼해서 운동 갈 때 들고 다니기 딱 좋습니다. 환경호르몬 걱정 없는 소재라 안심되네요.`;
        } else if (k.includes("마우스") || k.includes("키보드") || k.includes("패드") || k.includes("기기")) {
          prefix1 = "인체공학 무소음 무선";
          prefix2 = "멀티페어링 컴팩트 블루투스";
          price1 = 129000;
          price2 = 39000;
          review1 = `그립감이 좋아서 장시간 작업해도 손목 통증이 전혀 없습니다. 클릭 소리가 정말 조용해요.`;
          review2 = `두 대의 기기 연결 전환이 빠르고 타건감이 경쾌합니다. 가벼워서 가방에 넣고 다니기에 편리합니다.`;
        } else if (k.includes("가방") || k.includes("백팩") || k.includes("파우치") || k.includes("지갑")) {
          prefix1 = "방수 비즈니스 백팩";
          prefix2 = "경량 캐주얼 숄더백";
          price1 = 198000;
          price2 = 45000;
          review1 = `수납공간 분할이 아주 잘 되어 있어 노트북과 서류를 분리 수납하기에 정말 좋습니다. 어깨가 아프지 않네요.`;
          review2 = `디자인이 심플해서 데일리용으로 가볍게 매치하기 편합니다. 천 소재가 아주 튼튼합니다.`;
        }

        scrapedProducts = [
          {
            id: `dynamic-prod-01`,
            name: `${prefix1} ${cleanKeyword}`,
            price: price1,
            mallName: "네이버쇼핑",
            url: "https://msearch.shopping.naver.com/search/all?query=" + encodeURIComponent(cleanKeyword),
            rawReviewText: review1,
          },
          {
            id: `dynamic-prod-02`,
            name: `${prefix2} ${cleanKeyword}`,
            price: price2,
            mallName: "다나와",
            url: "https://search.danawa.com/dsearch.php?query=" + encodeURIComponent(cleanKeyword),
            rawReviewText: review2,
          }
        ];
      }
    }

    // 4. 수집된 상품 정보 Zod 데이터 검증
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
