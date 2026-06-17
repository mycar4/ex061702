import React from 'react';
import DOMPurify from 'dompurify';

interface ReviewSummaryProps {
  htmlReport: string;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({ htmlReport }) => {
  // WHATWG 및 React XSS 방지를 위한 DOMPurify 적용
  const sanitizedContent = React.useMemo(() => {
    return DOMPurify.sanitize(htmlReport);
  }, [htmlReport]);

  return (
    <div
      style={{
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--surface-color)',
        lineHeight: 1.6,
      }}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};
