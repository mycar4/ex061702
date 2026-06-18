import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';

const TopAppBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-surface/80 dark:bg-surface/80 border-b border-outline-variant/10 shadow-sm">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 w-full max-w-container-max mx-auto">
        <div className="flex items-center gap-8">
          <span 
            className="font-display-lg text-display-lg-mobile tracking-tight text-primary dark:text-primary-fixed cursor-pointer"
            onClick={() => navigate('/')}
          >
            ShopWise AI
          </span>
          <nav className="hidden md:flex gap-6 items-center">
            <a className="font-label-caps text-label-caps text-primary font-bold hover:text-secondary transition-colors duration-200" href="/">홈</a>
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-secondary transition-colors duration-200" href="#">비교</a>
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-secondary transition-colors duration-200" href="#">분석</a>
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-secondary transition-colors duration-200" href="#">리포트</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {location.pathname === '/search' && (
            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant/20 focus-within:ring-2 focus-within:ring-secondary/50 transition-all">
              <span className="material-symbols-outlined text-outline">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 text-body-sm px-2 w-64 text-on-surface outline-none" 
                placeholder="고성능 노트북" 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
          )}
          <div className="flex gap-2 items-center">
            <button className="p-2 text-on-surface-variant hover:text-primary active:scale-95 duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            
            <Dialog>
              <DialogTrigger asChild>
                <button className="p-2 text-on-surface-variant hover:text-primary active:scale-95 duration-200 flex items-center">
                  <span className="material-symbols-outlined">account_circle</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>로그인 및 회원가입</DialogTitle>
                  <DialogDescription>
                    ShopWise AI의 스마트한 추천 기능을 모두 이용해 보세요.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      이메일
                    </Label>
                    <Input id="email" type="email" placeholder="name@example.com" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      비밀번호
                    </Label>
                    <Input id="password" type="password" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-col gap-2">
                  <Button type="submit" className="w-full">이메일로 계속하기</Button>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-outline-variant/30" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-surface px-2 text-on-surface-variant">또는</span>
                    </div>
                  </div>
                  <Button type="button" variant="outline" className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100 flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Google로 로그인
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;
