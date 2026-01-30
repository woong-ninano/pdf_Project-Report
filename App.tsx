
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InfoSection from './components/InfoSection';
import AdminDashboard from './components/AdminDashboard';
import { SiteConfig } from './types';
import { supabase } from './lib/supabase';

const INITIAL_CONFIG: SiteConfig = {
  headerLogoUrl: "https://i.ibb.co/k2Yn9STr/img-logo-ty1.png",
  headerProjectTitle: "다이렉트 플랫폼 고도화 구축",
  headerTopText: "Project Completion Report",
  heroBadge: "Project Completion Report 2025",
  heroTitle1: "현대해상 다이렉트\n디지털 혁신의 기록",
  heroTitle2: "보험의 본질은 지키고,\n경험의 가치는 새롭게 정의하다.",
  heroDesc1: "보험의 본질은 지키고,",
  heroDesc2: "경험의 가치는 새롭게 정의하다.",
  contentItems: [],
  adminPassword: "1234"
};

const MASTER_RESET_KEY = 'reset';

const App: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig>(INITIAL_CONFIG);
  const [loading, setLoading] = useState(true);
  const [isAdminRoute, setIsAdminRoute] = useState(window.location.hash === '#admin');
  const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem('admin_auth') === 'true');
  const [passwordInput, setPasswordInput] = useState('');
  const [footerLogoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminRoute(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_configs')
        .select('config')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        console.error('데이터 로드 실패:', error);
        return;
      }

      if (data && data.config) {
        const fetchedConfig = data.config as SiteConfig;
        if (!fetchedConfig.adminPassword) {
          fetchedConfig.adminPassword = "1234";
        }
        setConfig(fetchedConfig);
      }
    } catch (err) {
      console.error('시스템 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig: SiteConfig) => {
    try {
      const { error } = await supabase
        .from('site_configs')
        .upsert({ 
          id: 1, 
          config: newConfig, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'id' });

      if (error) {
        console.error('Save Error:', error);
        
        // RLS(Row-Level Security) 권한 에러 감지 시 가이드 제공
        if (error.code === '42501' || error.message.includes('row-level security')) {
          alert(
            '⚠️ DB 저장 권한 오류 (RLS Policy)\n\n' +
            'Supabase SQL Editor에서 아래 명령어를 실행하여 쓰기 권한을 허용해주세요:\n\n' +
            'CREATE POLICY "Allow public all" ON public.site_configs FOR ALL USING (true) WITH CHECK (true);'
          );
          return false;
        }

        alert(`DB 저장 실패: ${error.message}`);
        return false;
      }
      setConfig(newConfig);
      alert('설정이 성공적으로 저장되었습니다!');
      return true;
    } catch (err: any) {
      alert(`시스템 오류: ${err.message}`);
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = passwordInput.trim();
    if (input.toLowerCase() === MASTER_RESET_KEY.toLowerCase()) {
      if (window.confirm("비밀번호를 '1234'로 리셋하시겠습니까?")) {
        const resetConfig = { ...config, adminPassword: '1234' };
        await saveConfig(resetConfig);
      }
      return;
    }
    if (input === (config.adminPassword || '1234')) {
      setIsLoggedIn(true);
      sessionStorage.setItem('admin_auth', 'true');
      setPasswordInput('');
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('admin_auth');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-400">데이터 동기화 중...</p>
        </div>
      </div>
    );
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return (
        <div className="h-screen flex items-center justify-center bg-gray-50 px-6">
          <div className="text-center p-8 md:p-12 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full">
            <h1 className="text-2xl font-bold mb-8 text-gray-900">관리자 모드</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-center font-bold"
              />
              <button type="submit" className="w-full py-3 bg-[#004a99] text-white rounded-xl font-bold">접속</button>
            </form>
          </div>
        </div>
      );
    }
    return <AdminDashboard config={config} onSave={saveConfig} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header logoUrl={config.headerLogoUrl} projectTitle={config.headerProjectTitle} />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden py-24 md:py-0">
        <div className="max-w-7xl mx-auto px-6 text-center z-10">
          <div className="inline-block px-4 py-1.5 mb-6 text-[10px] md:text-xs font-bold tracking-widest text-[#004a99] uppercase bg-blue-50 rounded-full">
            {config.heroBadge}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 !leading-tight md:leading-[1.1] tracking-tight whitespace-pre-line">
            {config.heroTitle1}
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-2xl text-gray-900 font-normal leading-relaxed whitespace-pre-line">
            {config.heroTitle2}
          </p>
          <div className="mt-16 animate-bounce flex justify-center opacity-20">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      <main className="bg-white">
        {config.contentItems && config.contentItems.length > 0 && (
          <InfoSection items={config.contentItems} id="main-content" />
        )}
      </main>

      <footer className="bg-white py-16 md:py-24 border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center items-center mb-8 h-12">
            {!footerLogoError ? (
              <img src={config.headerLogoUrl} alt="로고" className="h-8 md:h-10 object-contain" onError={() => setLogoError(true)} />
            ) : (
              <div className="text-[#004a99] font-bold text-xl md:text-2xl tracking-tighter">현대해상 <span className="text-[#ff6a00]">다이렉트</span></div>
            )}
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-[10px] md:text-sm font-medium text-gray-900">
            <span>현대해상화재보험(주) CM사업본부</span>
            <span className="hidden md:block w-px h-3 bg-gray-600"></span>
            <span>디지털 플랫폼 고도화 구축 완료 보고</span>
          </div>
          <div className="mt-6">
            <button onClick={() => window.location.hash = '#admin'} className="text-[10px] text-gray-300 opacity-0 hover:opacity-100 transition-opacity underline decoration-dotted">ADMIN</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
