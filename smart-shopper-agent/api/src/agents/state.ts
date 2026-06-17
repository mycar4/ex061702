export interface Product {
  id: string;
  name: string;
  price: number;
  mallName: string;
  url: string;
  rawReviewText?: string;
}

export interface AgentState {
  userQuery: string;
  products: Product[];
  retrievedProducts: Product[];
  report: string;
  error?: string;
}
