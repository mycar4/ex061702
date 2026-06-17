import React from 'react';
import { SearchInput } from '../components/ui/SearchInput';

export const SearchPage: React.FC = () => {
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // 페이지 이동 로직 (또는 상태 업데이트)
  };

  return (
    <div style={{ maxWidth: '600px', margin: '100px auto', padding: '0 var(--spacing-md)' }}>
      <h1 style={{ fontSize: 'var(--font-size-h1)', textAlign: 'center', color: 'var(--primary-color)', marginBottom: 'var(--spacing-xl)' }}>
        Smart Shopper Agent
      </h1>
      <SearchInput onSearch={handleSearch} placeholder="원하시는 상품과 요구조건을 입력하세요" />
    </div>
  );
};
