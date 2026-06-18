import React from 'react';

// 1. ButtonProps 인터페이스에 variant 속성 명시적 추가
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | string; // variant 허용
}

export const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  variant = "primary", // 기본값 설정
  className = "",
  ...props
}) => {
  // DESIGN_SYSTEM.md 토큰을 반영한 스타일 분기 (예시)
  const baseStyle = "transition-all duration-200 active:scale-95";
  const variantStyle = variant === 'primary' 
    ? "bg-[var(--stitch-color-primary,#1a146b)] text-white" 
    : "bg-transparent text-[var(--stitch-text-primary,#0d1c2e)]";

  return (
    <button
      type={type}
      className={`${baseStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};