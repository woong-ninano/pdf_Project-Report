
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  logoUrl: string;
  projectTitle: string;
}

const Header: React.FC<HeaderProps> = ({ logoUrl, projectTitle }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 no-print ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-5' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Left: Logo Area */}
        <div 
          className="flex items-center cursor-pointer"
          onClick={scrollToTop}
          title="최상단으로 이동"
        >
          {!logoError ? (
            <img 
              src={logoUrl} 
              alt="현대해상 다이렉트" 
              className="h-7 md:h-8 object-contain transition-transform duration-300 hover:scale-105"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex items-center group">
              <span className="text-[#004a99] font-extrabold text-xl md:text-2xl tracking-tighter flex items-center">
                현대해상 <span className="text-[#ff6a00] ml-1.5">다이렉트</span>
              </span>
            </div>
          )}
        </div>

        {/* Right: Project Title & Print Button */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className={`text-base lg:text-lg font-bold transition-colors duration-500 ${isScrolled ? 'text-gray-900' : 'text-gray-800'}`}>
              {projectTitle}
            </span>
          </div>
          {/*
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#004a99] text-white text-xs font-bold rounded-full hover:bg-blue-800 transition-all shadow-md active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            PDF 저장
          </button>
          */}
        </div>
      </div>
    </header>
  );
};

export default Header;
