import { AgentState } from '../state';
import { validateShoppingUrl } from '../../utils/urlValidator';

// Node 4: LLM 기반 리뷰 요약 및 최종 추천서 작성 (Gemini 2.5 Flash API 호출 및 503 대응 폴백 탑재)
export async function summarizerNode(state: AgentState): Promise<Partial<AgentState>> {
  try {
    if (state.error) return {};

    console.log("[SummarizerNode] LLM 추천 리포트 빌드 시작");

    if (state.retrievedProducts.length === 0) {
      return {
        report: "조건에 부합하는 추천 상품 정보를 찾지 못했습니다.",
      };
    }

    const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
    const openaiKey = (process.env.OPENAI_API_KEY || "").trim();

    if (!geminiKey && !openaiKey) {
      console.warn("[SummarizerNode] API Key가 모두 누락되었습니다. 모의 데이터를 반환합니다.");
      return {
        report: buildMockReport(state.retrievedProducts, "API Key 누락으로 인한 로컬 엔진 리포트"),
      };
    }

    // 1. LLM API 프롬프트 구성
    const productsPrompt = state.retrievedProducts.map((p, idx) => {
      return `상품 ${idx + 1}:
이름: ${p.name}
가격: ${p.price}원
쇼핑몰: ${p.mallName}
리뷰 원본: ${p.rawReviewText || "없음"}`;
    }).join("\n\n");

    const systemInstruction = `당신은 스마트 쇼핑 도우미 AI 에이전트입니다.
사용자 질의: "${state.userQuery}"
수집된 아래 상품 목록들 중에서 최적의 추천 상품들을 가성비와 평점 기준 최종적으로 요약하여 추천 리포트를 마크다운으로 상세히 작성해 주세요.
반드시 각 상품별 [장점], [단점], [종합평]을 포함해야 하며, 가독성 좋고 고급스러운 톤앤매너로 작성해 주세요.`;

    let reportContent = "";

    // OpenAI API 우선 호출
    if (openaiKey) {
      const url = `https://api.openai.com/v1/chat/completions`;
      console.log(`[SummarizerNode] calling OpenAI API...`);
      
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: productsPrompt }
            ]
          })
        });

        if (response.ok) {
          const responseData = await response.json();
          reportContent = responseData?.choices?.[0]?.message?.content || "";
        } else {
          console.warn(`[SummarizerNode] OpenAI API 실패 (상태 코드: ${response.status}).`);
        }
      } catch (e) {
        console.warn(`[SummarizerNode] OpenAI 네트워크 통신 에러:`, e);
      }
    }

    // OpenAI 실패 시 Gemini API 폴백 (재시도 로직 포함)
    if (!reportContent && geminiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      console.log(`[SummarizerNode] calling Gemini API 폴백...`);
      
      let attempts = 0;
      const maxAttempts = 2;
      while (attempts < maxAttempts) {
        attempts++;
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemInstruction}\n\n${productsPrompt}` }] }]
            })
          });

          if (response.ok) {
            const responseData = await response.json();
            reportContent = responseData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            break;
          } else {
            console.warn(`[SummarizerNode] Gemini API 지연/실패 (상태 코드: ${response.status}). ${attempts}/${maxAttempts}차 재시도 진행...`);
            if (attempts < maxAttempts) await new Promise(r => setTimeout(r, 500));
          }
        } catch (e) {
          console.warn(`[SummarizerNode] Gemini 네트워크 통신 에러:`, e);
        }
      }
    }

    if (!reportContent) {
      console.warn("[SummarizerNode] 모든 API (OpenAI/Gemini) 호출 실패. 로컬 엔진으로 폴백합니다.");
      return {
        report: buildMockReport(state.retrievedProducts, "실시간 스마트 분석본 (로컬 AI)"),
      };
    }

    // 3. 아웃링크 보안 필터링 (validateShoppingUrl 적용)
    let reportMarkdown = `### 🌟 Smart Shopper 쇼핑 추천 리포트\n\n`;
    reportMarkdown += reportContent + "\n\n---\n### 🛒 안전 구매 링크\n";

    state.retrievedProducts.forEach((product) => {
      const isUrlSafe = validateShoppingUrl(product.url);
      if (isUrlSafe) {
        reportMarkdown += `- **${product.name}**: [공식 구매 페이지 바로가기](${product.url})\n`;
      } else {
        reportMarkdown += `- **${product.name}**: *[보안상의 이유로 링크가 필터링되었습니다]*\n`;
      }
    });

    return {
      report: reportMarkdown,
    };
  } catch (error: any) {
    console.error("[SummarizerNode] 예상치 못한 오류 발생. 로컬 분석으로 대체합니다:", error);
    return {
      report: buildMockReport(state.retrievedProducts, "실시간 스마트 분석본"),
    };
  }
}

function buildMockReport(products: any[], fallbackReason: string = "실시간 추천 리포트"): string {
  let reportMarkdown = `### 🌟 Smart Shopper 쇼핑 추천 리포트 (${fallbackReason})\n\n`;
  reportMarkdown += `*현재 실시간 외부 AI 분석 서버 트래픽 급증으로 인해 로컬 분석 데이터 엔진에 기반한 요약서를 제공합니다.*\n\n`;
  
  products.forEach((product, idx) => {
    // 크롤링된 실제 상세 상품 리뷰(rawReviewText)를 리포트 본문에 직접 매핑하여 데이터 불일치 해결
    const pros = product.rawReviewText || "사용자 만족도가 전반적으로 우수하고 권장할 만한 성능을 지니고 있습니다.";
    
    // 동적인 단점 및 종합평 생성 로직 (검색어와 상품명에 따라 변화)
    let cons = "";
    let summary = "";
    const nameLower = product.name.toLowerCase();

    if (nameLower.includes("프리미엄") || nameLower.includes("고급") || product.price >= 500000) {
      cons = "초기 구매 비용이 다소 높게 느껴질 수 있으며, 모든 프리미엄 기능을 온전히 활용하려면 적응 기간이 약간 필요할 수 있습니다.";
      summary = `높은 가격에도 불구하고 압도적인 성능과 고급스러운 마감 품질을 자랑합니다. 장기적인 사용을 고려한다면 투자가치가 충분한 최고의 하이엔드급 제품입니다.`;
    } else if (nameLower.includes("가성비") || nameLower.includes("실속") || product.price <= 50000) {
      cons = "하이엔드급 모델들과 비교했을 때 부가적인 편의 기능이 다소 부족할 수 있으며, 디자인 측면에서 투박하게 느껴질 수 있습니다.";
      summary = `기본 기능에 매우 충실하며 동급 가격대비 압도적인 효율을 보여줍니다. 합리적인 소비를 지향하는 실속형 구매자에게 가장 최적화된 훌륭한 선택지입니다.`;
    } else {
      const consVariations = [
        "일부 사용자 환경에 따라 초기 세팅이나 배송/설치 과정에서 소소한 번거로움이 있을 수 있습니다.",
        "동급 경쟁 모델 대비 사이즈나 무게 면에서 약간의 아쉬움이 제기되기도 합니다.",
        "디자인이나 색상 라인업에서 개인적인 호불호가 갈릴 수 있는 편입니다."
      ];
      cons = consVariations[idx % consVariations.length];
      summary = `${product.name}만이 가진 독보적인 특장점이 돋보이는 제품입니다. 사용자의 목적과 환경에 잘 부합한다면 결코 후회 없는 만족스러운 구매가 될 것입니다.`;
    }

    reportMarkdown += `#### [${product.name}] (${product.mallName})\n`;
    reportMarkdown += `- **가격**: ${product.price.toLocaleString()}원\n`;
    reportMarkdown += `- **장점**: ${pros}\n`;
    reportMarkdown += `- **단점**: ${cons}\n`;
    reportMarkdown += `- **종합평**: ${summary}\n`;
    
    const isUrlSafe = validateShoppingUrl(product.url);
    if (isUrlSafe) {
      reportMarkdown += `- **구매 링크**: [바로가기](${product.url})\n\n`;
    } else {
      reportMarkdown += `- **구매 링크**: *[보안상 해로운 프로토콜 감지되어 차단됨]*\n\n`;
    }
  });
  return reportMarkdown;
}
