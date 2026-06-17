import React from 'react';

interface RecommendationStreamProps {
  query: string;
}

export const RecommendationStream: React.FC<RecommendationStreamProps> = ({ query }) => {
  const [report, setReport] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query) return;

    setLoading(true);
    setReport('');

    // 백엔드 API 스트리밍 추천서 연결 예시
    const eventSource = new EventSource(`/api/recommend/stream?q=${encodeURIComponent(query)}`);

    eventSource.onmessage = (event) => {
      setReport((prev) => prev + event.data);
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      setLoading(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [query]);

  return (
    <div style={{ marginTop: 'var(--spacing-lg)' }}>
      {loading && <p style={{ color: 'var(--text-secondary)' }}>실시간 분석 및 추천 리포트 생성 중...</p>}
      {report && (
        <div style={{ whiteSpace: 'pre-wrap', padding: 'var(--spacing-md)', backgroundColor: 'var(--surface-color)' }}>
          {report}
        </div>
      )}
    </div>
  );
};
