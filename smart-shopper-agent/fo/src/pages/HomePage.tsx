import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const executeSearch = (q: string) => {
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <main className="pt-24 pb-32 min-h-screen hero-gradient">
      <section className="max-w-4xl mx-auto px-margin-mobile text-center mb-16">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-secondary ai-pulse"></div>
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">AI 에이전트 준비 완료</span>
        </div>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-8">
          쇼핑의 미래는 <span className="text-secondary">지능적입니다.</span>
        </h1>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
          <form onSubmit={handleSearch} className="relative flex items-center bg-white rounded-xl shadow-xl border border-outline-variant/30 overflow-hidden h-16 md:h-20 px-6 focus-within:ring-2 focus-within:ring-secondary/50">
            <span className="material-symbols-outlined text-outline text-3xl mr-4">search</span>
            <input 
              className="w-full bg-transparent border-none focus:ring-0 text-body-md md:text-headline-md font-body-md placeholder:text-outline/60 outline-none" 
              placeholder="어떤 상품을 찾으시나요? (예: 성능 좋은 100만원대 노트북 추천해줘)" 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="ml-4 bg-gradient-to-r from-primary to-secondary text-white px-6 md:px-8 py-3 rounded-lg font-bold hover:shadow-lg active:scale-95 transition-all whitespace-nowrap">
              AI에게 묻기
            </button>
          </form>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className="text-body-sm text-on-surface-variant flex items-center">추천 검색어:</span>
          {["150만원 이하 최고의 OLED TV", "다이슨 vs 삼성 청소기 비교", "아이폰 15 프로 최저가 찾기"].map(tag => (
            <button 
              key={tag}
              onClick={() => executeSearch(tag)}
              className="px-4 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/20 text-body-sm hover:border-secondary transition-colors hover:text-secondary"
            >
              "{tag}"
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-8 space-y-gutter">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">auto_awesome</span>
              인기 급상승 AI 딜
            </h2>
            <a className="text-label-caps font-label-caps text-secondary hover:underline underline-offset-4" href="#">전체 보기</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative h-56 w-full overflow-hidden">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="프리미엄 노트북" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvMoVZB2fIzu9N7ci0-KWUTJ12--rwCcnT_--SceTc10Tj9O8WOH2f7y-v_4DXg3ADlsgJRzkx6kpDXngo59L8tu7e0Y77l9dB3zNwgDwZjBBnPKBMTLM4nqCCrWOLffQcUk9TFyUgyRgz8S5Pr61Pv70uSk1f7Zmbqu-euUikoWMXl2kH5Lp-azEKVoEhj-F03erYNDmsrnarP0cdFcfFkr0sDxrGif26H7GqCTqez6nwsxVTi0kl8tvEbiXtbvvlN0dvB7zpl0w"/>
                <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-label-caps font-label-caps">24% 할인</div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline-md text-body-md text-on-surface line-clamp-1">프리미엄 노트북 14형 프로</h3>
                  <div className="flex items-center text-secondary">
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="text-label-caps ml-1">4.9</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-price-lg text-price-lg text-primary">₩1,450,000</span>
                  <span className="text-body-sm text-outline line-through">₩1,890,000</span>
                </div>
                <div className="p-3 bg-secondary/5 rounded-lg border border-secondary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-secondary text-base">psychology</span>
                    <span className="text-label-caps text-secondary">AI 감성 분석</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">"이 가격대에서 대적할 수 없는 디스플레이 품질입니다. 역대 최저가 달성."</p>
                </div>
              </div>
            </div>
            
            <div className="glass-card rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative h-56 w-full overflow-hidden">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="노이즈 캔슬링" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIZ7DCCYqw4gMNKDNcgOnce8V175OPF2dhERU7l3IDLC36adb_8BVwiTDWmqo8Z--PIzE190oYW_ELMsuJsbNnc-G_8svCjmW9n3eLZkR7O3bkrYmeSiqmrgxH2CKeZD58MZWcJ7_o5iqNeank2aQseodAeGjA9ivottDVk6FLbvX3N1pO4OApVYavA90lFmrzwgy_42asKsJic9IIjFtL-RNk3NmUxjtLkEfQLO7Hpd85WySVqLLh9OQxsytThtidTn84dF84gks"/>
                <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-label-caps font-label-caps">가성비 최고</div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline-md text-body-md text-on-surface line-clamp-1">노이즈 캔슬링 무선 이어폰</h3>
                  <div className="flex items-center text-secondary">
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="text-label-caps ml-1">4.8</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-price-lg text-price-lg text-primary">₩289,000</span>
                  <span className="text-body-sm text-outline line-through">₩349,000</span>
                </div>
                <div className="p-3 bg-secondary/5 rounded-lg border border-secondary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-secondary text-base">psychology</span>
                    <span className="text-label-caps text-secondary">AI 감성 분석</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">"전문 리뷰어들 사이에서 착용감 부문 부동의 1위를 기록 중입니다."</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-gutter">
          <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">grid_view</span>
            카테고리
          </h2>
          <div className="grid grid-cols-2 gap-4 flex-grow">
            {[
              { icon: 'laptop_mac', label: '테크' },
              { icon: 'checkroom', label: '패션' },
              { icon: 'home_mini', label: '생활' },
              { icon: 'fitness_center', label: '스포츠' },
            ].map(cat => (
              <div key={cat.label} className="glass-card rounded-xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-primary-container hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-4xl mb-3 text-secondary group-hover:text-white">{cat.icon}</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider">{cat.label}</span>
              </div>
            ))}
          </div>

          <div className="bg-primary-container text-on-primary-container rounded-xl p-6 relative overflow-hidden shadow-lg group mt-4">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[120px]">insights</span>
            </div>
            <h3 className="font-headline-md text-headline-md mb-2">가격 히스토리</h3>
            <p className="text-body-sm opacity-80 mb-4">AI 알림을 통해 30일 가격 추이를 추적하고 역대 최저가에 구매하세요.</p>
            <button className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-body-sm">분석 데이터 보기</button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
