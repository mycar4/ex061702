import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentState } from "./state";
import { scrapeNode } from "./nodes/scrape";
import { vectorizeNode } from "./nodes/vectorize";
import { retrieverNode } from "./nodes/retriever";
import { summarizerNode } from "./nodes/summarizer";

// LangGraph StateGraph 파이프라인 정의
const graphChannels = {
  userQuery: {
    value: (x: string, y: string) => y ?? x,
    default: () => "",
  },
  products: {
    value: (x: any[], y: any[]) => y ?? x,
    default: () => [],
  },
  retrievedProducts: {
    value: (x: any[], y: any[]) => y ?? x,
    default: () => [],
  },
  report: {
    value: (x: string, y: string) => y ?? x,
    default: () => "",
  },
  error: {
    value: (x: string | undefined, y: string | undefined) => y ?? x,
    default: () => undefined,
  }
};

const workflow = new StateGraph<AgentState>({
  channels: graphChannels,
})
  .addNode("scrape", scrapeNode)
  .addNode("vectorize", vectorizeNode)
  .addNode("retriever", retrieverNode)
  .addNode("summarizer", summarizerNode);

// START 노드에서 scrape 노드로 진입
workflow.addEdge(START, "scrape");

// 조건부 라우팅 함수: 에러 발생 시 즉시 END로 분기
workflow.addConditionalEdges("scrape", (state: AgentState) => {
  return state.error ? END : "vectorize";
});

workflow.addConditionalEdges("vectorize", (state: AgentState) => {
  return state.error ? END : "retriever";
});

workflow.addConditionalEdges("retriever", (state: AgentState) => {
  return state.error ? END : "summarizer";
});

workflow.addEdge("summarizer", END);

export const app = workflow.compile();
