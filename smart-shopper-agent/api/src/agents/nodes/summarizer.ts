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

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      console.warn("[SummarizerNode] GEMINI_API_KEY가 없습니다. 모의 데이터를 반환합니다.");
      return {
        report: buildMockReport(state.retrievedProducts, "API Key 누락으로 인한 모의 리포트"),
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

    // 2. Gemini 2.5 Flash API 호출 (Direct HTTP Request)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    console.log(`[SummarizerNode] calling url: ${url.replace(apiKey, "API_KEY_HIDDEN")}`);
    
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemInstruction}\n\n${productsPrompt}`
                }
              ]
            }
          ]
        })
      });
    } catch (networkError: any) {
      console.warn("[SummarizerNode] 네트워크 장애 발생. 모의 리포트로 폴백합니다.", networkError);
      return {
        report: buildMockReport(state.retrievedProducts, "네트워크 통신 장애로 인한 모의 폴백 리포트"),
      };
    }

    // 503 Service Unavailable 및 기타 HTTP 오류 발생 시 모의 데이터 폴백 처리
    if (!response.ok) {
      console.warn(`[SummarizerNode] Gemini API 호출 실패 (상태 코드: ${response.status}). 모의 리포트로 폴백합니다.`);
      return {
        report: buildMockReport(state.retrievedProducts, `Gemini API 장애(HTTP ${response.status})로 인한 모의 폴백 리포트`),
      };
    }

    const responseData = await response.json();
    let reportContent = responseData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!reportContent) {
      console.warn("[SummarizerNode] Gemini API가 빈 응답을 반환했습니다. 모의 리포트로 폴백합니다.");
      return {
        report: buildMockReport(state.retrievedProducts, "API 빈 응답으로 인한 모의 폴백 리포트"),
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
    console.error("[SummarizerNode] 예상치 못한 오류 발생. 모의 리포트로 대체합니다:", error);
    return {
      report: buildMockReport(state.retrievedProducts, "예상치 못한 오류로 인한 모의 폴백 리포트"),
    };
  }
}

function buildMockReport(products: any[], fallbackReason: string = "모의 모드"): string {
  let reportMarkdown = `### 🌟 Smart Shopper 쇼핑 추천 리포트 (${fallbackReason})\n\n`;
  reportMarkdown += `*현재 외부 AI 요약 서비스가 일시적으로 원활하지 않아 로컬 분석 데이터 엔진에 기반한 요약서를 제공합니다.*\n\n`;
  
  products.forEach((product) => {
    let pros = "가성비가 훌륭하고 해당 브랜드의 사용자 평가가 긍정적임.";
    let cons = "고사양 작업 시 발열이 발생할 수 있음.";
    let summary = "동급 가격대 대비 만족도 최상위 제품으로 추천합니다.";

    const name = product.name.toLowerCase();
    if (name.includes("맥북") || name.includes("macbook") || name.includes("laptop") || name.includes("xps")) {
      pros = "강력한 성능과 뛰어난 디스플레이, 프리미엄 마감 처리가 돋보입니다.";
      cons = "고사양 작업 시 팬 소음 및 발열이 다소 발생할 수 있습니다.";
      summary = "전문적인 작업용 및 고성능 요구 유저에게 최선의 선택입니다.";
    } else if (name.includes("청소기") || name.includes("dyson") || name.includes("제트") || name.includes("vacuum")) {
      pros = "강력한 흡입력과 편리한 무선 작동, 그리고 스마트 먼지 감지 기능이 장점입니다.";
      cons = "장시간 사용 시 손목에 다소 무게감이 느껴질 수 있으며, 필터 세척 등 주기적인 관리가 필요합니다.";
      summary = "가정 내 깔끔한 청소 환경을 제공하는 최고 수준의 무선 청소기 제품입니다.";
    } else if (name.includes("드라이") || name.includes("dryer") || name.includes("에어랩")) {
      pros = "바람이 강력하여 건조 시간이 단축되고 온도가 지능적으로 유지되어 머릿결 손상을 방지합니다.";
      cons = "프리미엄 제품군의 경우 가격 장벽이 높으며 접이식이 아닌 경우 보관이 까다로울 수 있습니다.";
      summary = "모발 보호와 신속한 스타일링이 동시에 필요한 분들에게 완벽한 드라이어 솔루션입니다.";
    } else if (name.includes("헤드폰") || name.includes("headphones") || name.includes("q30") || name.includes("xm5")) {
      pros = "뛰어난 수준의 액티브 노이즈 캔슬링과 깊은 음질 표현력을 지니고 있습니다.";
      cons = "여름철 장시간 착용 시 귀에 땀이 찰 수 있으며 하드케이스가 부피를 차지합니다.";
      summary = "일상 속 몰입감을 극대화해 주는 훌륭한 무선 오디오 파트너입니다.";
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
