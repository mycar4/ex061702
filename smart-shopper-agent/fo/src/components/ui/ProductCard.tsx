import React from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  mallName: string;
  url: string;
}

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(product)}
      style={{
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--surface-color)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      <h3 style={{ fontSize: 'var(--font-size-h2)', margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-primary)' }}>
        {product.name}
      </h3>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
        {product.mallName} | <strong style={{ color: 'var(--primary-color)' }}>{product.price.toLocaleString()}원</strong>
      </div>
    </div>
  );
};
