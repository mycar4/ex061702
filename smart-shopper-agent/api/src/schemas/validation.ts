import { z } from 'zod';

// 사용자 쿼리 스키마 (보안 강화: 최대 길이 제한 및 비어있는 검색 방지)
export const UserQuerySchema = z.object({
  query: z.string()
    .min(2, { message: "검색어는 최소 2글자 이상 입력해야 합니다." })
    .max(100, { message: "검색어는 최대 100글자까지 지원합니다." })
    .trim(),
});

// 쇼핑몰 가격/리뷰 수집 데이터 스키마
export const ProductDataSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  name: z.string().min(1).max(255),
  price: z.number().nonnegative().max(100_000_000), // 비정상적인 초고가 차단
  mallName: z.string().min(1).max(50),
  url: z.string().url(),
  rawReviewText: z.string().max(5000).optional(),
});
