import React from 'react';
import { RecommendationStream } from '../components/containers/RecommendationStream';

export const ResultPage: React.FC = () => {
  // 실제 프로덕션 환경에서는 URL 파라미터 또는 전역 상태에서 쿼리를 가져옴
  const query = "가성비 좋은 노이즈 캔슬링 헤드폰 추천해줘";

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '0 var(--spacing-md)' }}>
      <h2 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>
        추천 결과 분석 리포트
      </h2>
      <RecommendationStream query={query} />
    </div>
  );
};
