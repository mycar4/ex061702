import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { app } from './agents/workflow';

// .env 파일 로드 (Gemini API Key 획득용)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const server = express();

server.use(cors());
server.use(express.json());

// 정적 HTML 디자인 리소스 폴더 제공
server.use(express.static(path.resolve(__dirname, '../../designs')));

// Swagger 설정
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Shopper AI API',
      version: '1.0.0',
      description: 'Smart Shopper AI 에이전트의 백엔드 API 문서',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: '로컬 개발 서버',
      },
    ],
  },
  apis: ['./src/server.ts'], // 현재 파일의 주석을 파싱
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /api/recommend/stream:
 *   get:
 *     summary: 상품 추천 및 리포트 스트리밍
 *     description: 사용자 쿼리에 기반하여 관련 상품을 RAG로 검색하고, Gemini LLM을 통해 추천 리포트를 Server-Sent Events(SSE)로 실시간 스트리밍합니다.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: 검색어 (예. 고성능 노트북, 나무의자)
 *     responses:
 *       200:
 *         description: SSE 스트림 응답. type이 'products', 'report', 'error'인 JSON 포맷의 데이터 반환.
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
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
