import * as dotenv from 'dotenv';
import * as path from 'path';
import { app } from './agents/workflow';

// .env 파일 로드 (Gemini API Key 획득용)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
  console.log("=== LangGraph 쇼핑 에이전트 파이프라인 검증 시작 ===");

  // 정상 시나리오 검증: 100만원 이하 노트북 추천해줘 (2글자 이상)
  const successState = await app.invoke({
    userQuery: "노이즈 캔슬링 헤드폰 추천해줘",
    products: [],
    retrievedProducts: [],
    report: "",
  });

  console.log("\n[정상 쿼리 실행 결과]");
  console.log("Error:", successState.error || "없음");
  console.log("Report:\n", successState.report);

  // Zod 입력 검증 실패 시나리오 검증: 1글자짜리 쿼리
  console.log("\n[Zod 입력 검증 실패 시나리오 검증]");
  const failState = await app.invoke({
    userQuery: "헤", // 2글자 미만
    products: [],
    retrievedProducts: [],
    report: "",
  });

  console.log("Error:", failState.error || "없음");
  console.log("Report:", failState.report || "없음");
}

main().catch(err => {
  console.error("테스트 실행 실패:", err);
});
