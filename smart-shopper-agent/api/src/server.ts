import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { app } from './agents/workflow';

// .env 파일 로드 (Gemini API Key 획득용)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const server = express();

server.use(cors());
server.use(express.json());

// 정적 HTML 디자인 리소스 폴더 제공
server.use(express.static(path.resolve(__dirname, '../../designs')));


// GET /api/recommend/stream?q=...
server.get('/api/recommend/stream', async (req, res) => {
  const query = req.query.q as string || '';

  // Server-Sent Events (SSE) 헤더 설정
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  console.log(`[API Server] 쿼리 수신: "${query}"`);

  try {
    // 1. LangGraph 워크플로우 실행
    const resultState = await app.invoke({
      userQuery: query,
      products: [],
      retrievedProducts: [],
      report: '',
    });

    if (resultState.error) {
      console.warn(`[API Server] 파이프라인 에러 발생: ${resultState.error}`);
      res.write(`data: ${JSON.stringify({ type: 'error', message: resultState.error })}\n\n`);
    } else {
      console.log(`[API Server] 상품 데이터 및 추천 리포트 생성 완료. 스트리밍 시작...`);
      
      // 1. 수집된 상품 정보를 먼저 구조화 데이터로 전송
      res.write(`data: ${JSON.stringify({ type: 'products', products: resultState.products })}\n\n`);
      
      // 2. 추천 리포트 마크다운을 순차 전송
      const report = resultState.report || '';
      const lines = report.split('\n');

      for (const line of lines) {
        res.write(`data: ${JSON.stringify({ type: 'report', text: line })}\n\n`);
        // 실시간 스트리밍 느낌을 주기 위해 미세한 딜레이를 추가합니다.
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
    }
  } catch (error: any) {
    console.error(`[API Server] 내부 에러 발생:`, error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: `Internal server error: ${error.message || error}` })}\n\n`);
  } finally {
    console.log(`[API Server] 스트리밍 종료`);
    res.end();
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[API Server] 서버가 http://localhost:${PORT} 에서 대기 중입니다.`);
});
export default server;
