import React from 'react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, placeholder }) => {
  const [value, setValue] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || "검색어를 입력하세요..."}
        style={{
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          fontSize: 'var(--font-size-body)',
          fontFamily: "'Outfit', 'Inter', sans-serif",
          flex: 1,
        }}
      />
      <button
        type="submit"
        style={{
          padding: 'var(--spacing-md) var(--spacing-lg)',
          backgroundColor: 'var(--primary-color)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-body)',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
      >
        검색
      </button>
    </form>
  );
};
