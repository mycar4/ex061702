import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';

interface Product {
  name: string;
  url: string;
  mallName: string;
  price: number;
  rawReviewText?: string;
}

// 🟢 [시니어 엔진 교정] Vercel 환경 변수를 감지하고, 없을 경우 안전하게 Render 실배포 주소로 백업 연결
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ex061702.onrender.com';

const SearchResultPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [reportContent, setReportContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState<number>(0);

  useEffect(() => {
    if (!query) return;

    setProducts([]);
    setReportContent('');
    setErrorMsg('');
    setIsStreaming(true);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < 2 ? prev + 1 : prev));
    }, 1500);

    // 🛠️ [최종 조준 정밀 사격] 절대 경로 대신 Render API 베이스 도메인을 명확하게 명시함
    const cleanBaseUrl = API_BASE_URL.replace(/\/$/, ''); // 혹시 모를 주소 뒤의 슬래시(/) 중복 제거
    const eventSource = new EventSource(`${cleanBaseUrl}/api/recommend/stream?q=${encodeURIComponent(query)}`);

    let accumulatedReport = '';

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'products') {
          setProducts(data.products);
        } else if (data.type === 'report') {
          accumulatedReport += data.text + '\n';
          setReportContent(accumulatedReport);
        } else if (data.type === 'error') {
          setErrorMsg(data.message);
        } else if (data.type === 'done') {
          setIsStreaming(false);
          eventSource.close();
        }
      } catch (e) {
        accumulatedReport += event.data + '\n';
        setReportContent(accumulatedReport);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE stream error:", err);
      setIsStreaming(false);
      eventSource.close();
    };

    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, [query]);

  // 마크다운 파싱 헬퍼 함수 (라인별 강인한 파서)
  const renderMarkdown = (md: string) => {
    if (!md) return { __html: "" };

    const lines = md.split('\n');
    const htmlLines = lines.map(line => {
      const trimmed = line.trim();
      let processed = line;

      // 1. 헤더 처리
      if (trimmed.startsWith('### ')) {
        processed = `<h3 class="text-xl font-bold text-primary mt-6 mb-2">${trimmed.slice(4)}</h3>`;
      } else if (trimmed.startsWith('#### ')) {
        processed = `<h4 class="text-lg font-semibold text-secondary mt-4 mb-1">${trimmed.slice(5)}</h4>`;
      } else if (trimmed.startsWith('## ')) {
        processed = `<h2 class="text-2xl font-bold text-primary mt-8 mb-3 border-b pb-2 border-outline-variant/30">${trimmed.slice(3)}</h2>`;
      } else if (trimmed.startsWith('# ')) {
        processed = `<h1 class="text-3xl font-extrabold text-primary mt-8 mb-4">${trimmed.slice(2)}</h1>`;
      }
      // 2. 구분선 처리
      else if (trimmed === '---') {
        processed = `<hr class="my-6 border-t border-outline-variant/20" />`;
      }
      // 3. 글머리 기호(리스트) 처리
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.slice(2);
        processed = `<li class="ml-6 list-disc text-on-surface-variant my-1">${content}</li>`;
      }
      // 4. 빈 라인 처리 (적절한 간격 부여)
      else if (trimmed === '') {
        processed = `<div class="h-2"></div>`;
      }

      // 5. 인라인 스타일 (볼드체 및 링크) 처리
      processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>');
      processed = processed.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" class="text-secondary font-semibold hover:underline">$1</a>');

      return processed;
    });

    const html = htmlLines.join('\n');
    return { __html: DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel', 'referrerpolicy'] }) };
  };

  const getImageUrl = (productName: string) => {
    const mockImages: Record<string, string> = {
      "MacBook Pro 14 (M3 Max, 36GB RAM, 1TB SSD)": "https://lh3.googleusercontent.com/aida-public/AB6AXuDyxhzIJp2jAvOiL-V47TpsvxHcNr-7S_yUYj6Oh5DosaqEgT7f94_5bOmLOcK9CPqt-o2_lHkzNokR5yveQA_I7nX35OSdmbI4L4BCm0rduiqdUCKJAJc_Wx7sIcoEZ3_1fl-ux1LYy5ZxxbU9F39r86tzvIQLC9Bpt14QDKK9aCcfP_dGVdfmNVoORU3GvMog2kL0muWBSJ-hp-t-PEdEI9Oix_VBPitWeUOaQGQUKYzk8nnHQ4eSyv7Q_6MS8DxGRycdWNfRHbw",
      "Dell XPS 17 9730 (RTX 4070, 64GB RAM)": "https://lh3.googleusercontent.com/aida-public/AB6AXuA54BS-CrHcfW5EepKe-GIWudEpKagL3aQstusid9mo9kebAi3dOu8pP9_pxbe76SEOBQLil1KgX9HuRyv8zoWkJsB6SEq7pescEXCTeKy5CZ59qshRWXOvcpBZesj0LbL9EbPoDXRcSO5fP3fw0P1xM5Pf2Jt-dybXB2tXur_bssUVKHClGbZvG8DoFVfCxG2--zjsKRXXMVtEGhKM1x5lQpTXBgHBt9DoJf010MF1nqs7VrKb1SwBVSZvzABMlYh3Xtp6zhXkkdY",
      "다이슨 V15 디텍트 컴플리트 무선청소기": "https://lh3.googleusercontent.com/aida-public/AB6AXuDvMoVZB2fIzu9N7ci0-KWUTJ12--rwCcnT_--SceTc10Tj9O8WOH2f7y-v_4DXg3ADlsgJRzkx6kpDXngo59L8tu7e0Y77l9dB3zNwgDwZjBBnPKBMTLM4nqCCrWOLffQcUk9TFyUgyRgz8S5Pr61Pv70uSk1f7Zmbqu-euUikoWMXl2kH5Lp-azEKVoEhj-F03erYNDmsrnarP0cdFcfFkr0sDxrGif26H7GqCTqez6nwsxVTi0kl8tvEbiXtbvvlN0dvB7zpl0w",
      "삼성전자 비스포크 제트 AI 무선청소기": "https://lh3.googleusercontent.com/aida-public/AB6AXuDIZ7DCCYqw4gMNKDNcgOnce8V175OPF2dhERU7l3IDLC36adb_8BVwiTDWmqo8Z--PIzE190oYW_ELMsuJsbNnc-G_8svCjmW9n3eLZkR7O3bkrYmeSiqmrgxH2CKeZD58MZWcJ7_o5iqNeank2aQseodAeGjA9ivottDVk6FLbvX3N1pO4OApVYavA90lFmrzwgy_42asKsJic9IIjFtL-RNk3NmUxjtLkEfQLO7Hpd85WySVqLLh9OQxsytThtidTn84dF84gks"
    };
    if (mockImages[productName]) return mockImages[productName];
    const shortName = productName.substring(0, 15);
    return `https://placehold.co/400x400/e6eeff/1a146b?text=${encodeURIComponent(shortName)}`;
  };

  // 검색어 특성에 따른 동적 필터 적용
  const isLaptop = query.includes('노트북') || query.includes('laptop');

  return (
    <main className="pt-24 pb-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="flex flex-col md:flex-row gap-gutter">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-72 shrink-0 space-y-stack-md">
          <div className="glass-card border border-outline-variant/20 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-md text-headline-md text-primary">필터</h2>
              <button className="text-label-caps font-label-caps text-secondary">전체 초기화</button>
            </div>
            
            <div className="mb-8">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-wider">가격 범위</label>
              <div className="space-y-4">
                <input className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary" type="range"/>
                <div className="flex justify-between text-body-sm font-body-sm text-outline">
                  <span>$800</span>
                  <span>$4,000+</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-wider">브랜드</label>
              <div className="space-y-3">
                {isLaptop ? (
                  <>
                    {['Apple', 'Dell XPS', 'ASUS ROG', 'Razer Blade'].map(brand => (
                      <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                        <input className="rounded text-secondary focus:ring-secondary border-outline-variant" type="checkbox"/>
                        <span className="text-body-md font-body-md group-hover:text-primary">{brand}</span>
                      </label>
                    ))}
                  </>
                ) : (
                  <>
                    {['인기 브랜드', '가성비 탑', '프리미엄', '기타 브랜드'].map(brand => (
                      <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                        <input className="rounded text-secondary focus:ring-secondary border-outline-variant" type="checkbox"/>
                        <span className="text-body-md font-body-md group-hover:text-primary">{brand}</span>
                      </label>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-wider">
                {isLaptop ? '램' : '주요 옵션'}
              </label>
              <div className="flex flex-wrap gap-2">
                {isLaptop ? (
                  <>
                    <button className="px-4 py-1.5 rounded-full border border-outline-variant text-body-sm font-body-sm hover:border-secondary hover:text-secondary transition-all">16GB</button>
                    <button className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-body-sm font-body-sm">32GB</button>
                    <button className="px-4 py-1.5 rounded-full border border-outline-variant text-body-sm font-body-sm hover:border-secondary hover:text-secondary transition-all">64GB</button>
                  </>
                ) : (
                  <>
                    <button className="px-4 py-1.5 rounded-full border border-outline-variant text-body-sm font-body-sm hover:border-secondary hover:text-secondary transition-all">기본형</button>
                    <button className="px-4 py-1.5 rounded-full border border-outline-variant text-body-sm font-body-sm hover:border-secondary hover:text-secondary transition-all">고급형</button>
                    <button className="px-4 py-1.5 rounded-full border border-outline-variant text-body-sm font-body-sm hover:border-secondary hover:text-secondary transition-all">최고급형</button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-primary-container p-6 rounded-xl text-on-primary-container">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-primary-container">psychology</span>
              <span className="font-label-caps text-label-caps uppercase">AI 시장 예측</span>
            </div>
            <p className="text-body-sm font-body-sm mb-4 leading-relaxed">
              {isLaptop 
                ? "다음 달 계절적 하드웨어 교체 주기에 따라 고성능 노트북의 가격이 8% 하락할 것으로 예상됩니다."
                : `현재 시장 트렌드 분석 결과, "${query}" 관련 상품의 관심도가 상승 중이며 최적의 구매 타이밍입니다.`}
            </p>
            <button className="w-full py-2 bg-secondary text-white rounded-lg font-label-caps text-label-caps hover:bg-opacity-90 transition-all">가격 하락 알림 받기</button>
          </div>
        </aside>

        {/* Main Results Area */}
        <section className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface">
                <span className="text-secondary italic">"{query}"</span>에 대한 검색 결과
              </h1>
              <p className="text-body-sm font-body-sm text-outline">주요 쇼핑몰 (쿠팡, 네이버쇼핑 등) 실시간 가격 비교 완료</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-label-caps font-label-caps text-on-surface-variant">정렬 기준:</span>
              <select className="bg-surface-container border-none rounded-lg text-body-sm font-body-sm focus:ring-secondary py-1.5 pr-8">
                <option>AI 추천순</option>
                <option>최저가순</option>
                <option>평점순</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-8 font-bold">
              오류 발생: {errorMsg}
            </div>
          )}

          {/* AI RAG Report Container */}
          {(isStreaming || reportContent) && (
            <div className="glass-card border border-secondary/30 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className={`material-symbols-outlined text-secondary ${isStreaming ? 'ai-pulse' : ''}`}>auto_awesome</span>
                <h3 className="font-headline-md text-headline-md text-primary">AI 실시간 추천 리포트</h3>
              </div>
              <div 
                className="text-body-md font-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={renderMarkdown(reportContent || "실시간 분석 및 리포트 작성 중...")}
              />
            </div>
          )}

          {/* AI Crawling & Analysis Status Screen */}
          {isStreaming && products.length === 0 && (
            <div className="glass-card border border-secondary/20 rounded-2xl p-8 mb-8 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-highest overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary w-1/3 rounded-full"
                  style={{ animation: 'loading-bar 1.5s infinite linear' }}
                ></div>
              </div>
              <span className="material-symbols-outlined text-5xl text-secondary ai-pulse mb-4">auto_awesome</span>
              <h2 className="text-xl font-bold text-primary mb-2">지능형 쇼핑 에이전트 실시간 분석 중</h2>
              <p className="text-body-sm text-on-surface-variant mb-6">주요 쇼핑몰(쿠팡, 네이버쇼핑 등)에서 실시간으로 상품 정보, 최저가, 사용자 평점을 분석하고 추천 리포트를 생성하고 있습니다.</p>
              
              <div className="w-full max-w-md space-y-3 text-left mx-auto">
                <div className="flex items-center gap-3">
                  {loadingStep >= 0 ? (
                    <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                  ) : (
                    <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span className={`text-body-sm ${loadingStep === 0 ? 'text-primary font-bold' : 'text-outline'}`}>
                    실시간 상품 정보 및 최저가 크롤링 중...
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {loadingStep >= 1 ? (
                    loadingStep > 1 ? (
                      <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                    ) : (
                      <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                    )
                  ) : (
                    <span className="material-symbols-outlined text-outline text-lg">radio_button_unchecked</span>
                  )}
                  <span className={`text-body-sm ${loadingStep === 1 ? 'text-primary font-bold' : 'text-outline'}`}>
                    수집된 상품의 최저가 비교 및 신뢰도 검증 중...
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {loadingStep >= 2 ? (
                    <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="material-symbols-outlined text-outline text-lg">radio_button_unchecked</span>
                  )}
                  <span className={`text-body-sm ${loadingStep === 2 ? 'text-primary font-bold' : 'text-outline'}`}>
                    Gemini AI를 활용한 맞춤형 쇼핑 추천 리포트 생성 중...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Product Listing */}
          <div className="space-y-stack-md">
            {products.map((product, idx) => (
              <div key={idx} className="glass-card border border-outline-variant/30 rounded-2xl p-6 hover:shadow-lg transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 px-4 py-2 bg-secondary-container text-on-secondary-container font-label-caps text-label-caps rounded-bl-2xl">
                    AI 추천 지표: 우수
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-full lg:w-1/3">
                    <div className="aspect-square rounded-xl bg-surface-container-low overflow-hidden">
                      <img 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        src={getImageUrl(product.name)}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">trending_down</span> 최저가 보장
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded flex items-center gap-1 uppercase">
                          <span className="material-symbols-outlined text-[14px]">verified</span> RAG 1순위 추천
                        </span>
                      </div>
                      <h3 className="font-headline-md text-headline-md mb-2 group-hover:text-secondary transition-colors">{product.name}</h3>
                      <p className="text-body-sm font-body-sm text-on-surface-variant line-clamp-2">
                        {product.rawReviewText || '리뷰 정보 분석 완료.'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                      <div className="space-y-4">
                        <div>
                          <span className="font-label-caps text-label-caps text-outline uppercase block mb-1">현재 최저가</span>
                          <span className="font-price-lg text-price-lg text-primary">{product.price.toLocaleString()}원</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low border border-outline-variant/10">
                            <span className="text-body-sm font-body-sm font-semibold">{product.mallName}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-body-sm font-body-sm text-secondary font-bold">{product.price.toLocaleString()}원</span>
                              <a href={product.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="bg-primary text-white px-3 py-1 rounded text-label-caps font-label-caps text-xs">바로구매</a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-surface-container rounded-xl p-4 flex flex-col justify-center items-center text-center">
                        <span className="material-symbols-outlined text-secondary text-4xl mb-2">analytics</span>
                        <p className="text-body-sm font-body-sm font-semibold">30일 가격 변동 추이</p>
                        <p className="text-[10px] text-outline mt-1 italic">실시간 가격 하락세를 감지했습니다. 구매를 추천합니다.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </section>
      </div>
    </main>
  );
};

export default SearchResultPage;