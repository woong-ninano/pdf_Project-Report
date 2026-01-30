
import React, { useEffect, useRef, useState } from 'react';
import { SectionData } from '../types';

const STATUS_BAR_URL = "https://i.ibb.co/HDBCBq6B/status-bar-iphone.png";

const InfoSection: React.FC<SectionData> = ({ items }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [subImageIndices, setSubImageIndices] = useState<number[]>(items.map(() => 0));

  // 드래그 상태 관리 (데스크톱 전용)
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || window.innerWidth < 768) return;
      
      const { top, height } = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (top <= 0 && Math.abs(top) < height - windowHeight) {
        const totalScrollableHeight = height - windowHeight;
        const progress = Math.abs(top) / totalScrollableHeight;
        
        const index = Math.min(
          Math.floor(progress * items.length),
          items.length - 1
        );
        
        if (index !== activeItemIndex) {
          setActiveItemIndex(index);
        }
      } else if (top > 0) {
        setActiveItemIndex(0);
      } else {
        setActiveItemIndex(items.length - 1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items.length, activeItemIndex]);

  const handlePrevSubImage = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setSubImageIndices(prev => {
      const next = [...prev];
      next[idx] = Math.max(0, next[idx] - 1);
      return next;
    });
    if (scrollContainerRefs.current[idx]) {
      scrollContainerRefs.current[idx]!.scrollTop = 0;
    }
  };

  const handleNextSubImage = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setSubImageIndices(prev => {
      const next = [...prev];
      const maxIdx = items[idx].images.length - 1;
      next[idx] = Math.min(maxIdx, next[idx] + 1);
      return next;
    });
    if (scrollContainerRefs.current[idx]) {
      scrollContainerRefs.current[idx]!.scrollTop = 0;
    }
  };

  const onMouseDown = (e: React.MouseEvent, idx: number) => {
    if (window.innerWidth < 768) return;
    const container = scrollContainerRefs.current[idx];
    if (!container) return;
    setIsDragging(true);
    setStartY(e.pageY - container.offsetTop);
    setScrollTop(container.scrollTop);
  };

  const onMouseMove = (e: React.MouseEvent, idx: number) => {
    if (!isDragging || window.innerWidth < 768) return;
    e.preventDefault();
    const container = scrollContainerRefs.current[idx];
    if (!container) return;
    const y = e.pageY - container.offsetTop;
    const walk = (y - startY) * 1.5;
    container.scrollTop = scrollTop - walk;
  };

  return (
    <div className="w-full">
      {/* --- 모바일 레이아웃 --- */}
      <div className="block md:hidden bg-white w-full">
        {items.map((item, idx) => (
          <div key={idx} className="px-6 py-12 border-b border-gray-50 last:border-0 flex flex-col gap-8">
            <div className="w-full">
              <div className="text-[#004a99] font-black text-[10px] tracking-widest uppercase mb-2">Section {(idx + 1).toString().padStart(2, '0')}</div>
              <h2 className="text-2xl font-bold text-gray-900 leading-normal mb-4 whitespace-pre-line">           
                {item.title}
              </h2>
              <div className="w-8 h-[2px] bg-[#004a99] mb-4"></div>
              <p className="text-base text-[#666666] leading-relaxed font-normal whitespace-pre-line">
                {item.description}
              </p>
            </div>

            <div className="flex flex-col items-center w-full">
              <div className="relative w-full max-w-[260px] aspect-[9/19] bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border-[6px] border-black overflow-hidden flex flex-col print-phone-frame">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-b-2xl z-40 no-print"></div>
                <div className="relative z-30 w-full shrink-0">
                  <img src={STATUS_BAR_URL} alt="status bar" className="w-full h-auto block bg-white" />
                </div>

                <div className="relative flex-1 w-full bg-gray-50 overflow-hidden">
                   {item.images.map((img, imgIdx) => (
                      <div
                        key={imgIdx}
                        className={`absolute inset-0 w-full transform transition-all duration-700 ease-in-out ${
                          imgIdx === subImageIndices[idx] 
                            ? 'opacity-100 scale-100 z-10' 
                            : 'opacity-0 scale-105 z-0 pointer-events-none'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`${item.title} ${imgIdx}`} 
                          className="w-full h-full object-cover object-top" 
                        />
                      </div>
                    ))}
                </div>
              </div>
              
              {item.images.length > 1 && (
                <div className="flex items-center gap-6 mt-6 bg-gray-50/80 px-4 py-2 rounded-full border border-gray-100 no-print">
                  <button onClick={(e) => handlePrevSubImage(e, idx)} disabled={subImageIndices[idx] === 0} className="p-1 disabled:opacity-10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="text-[10px] font-bold text-gray-900">{subImageIndices[idx] + 1} / {item.images.length}</span>
                  <button onClick={(e) => handleNextSubImage(e, idx)} disabled={subImageIndices[idx] === item.images.length - 1} className="p-1 disabled:opacity-10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- 데스크톱 레이아웃 --- */}
      <div 
        ref={containerRef}
        className="hidden md:block relative w-full print-linear"
        style={{ height: `${items.length * 100}vh` }}
      >
        <div className="sticky top-0 h-screen w-full flex flex-row items-center justify-center gap-20 lg:gap-64 overflow-hidden max-w-7xl mx-auto px-12 print-linear">
          {/* Left: Text Area (Width constrained to 400px) */}
          <div className="w-[400px] shrink-0 flex items-center h-full print-linear">
            <div className="relative w-full print-linear">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={`transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) w-full print-section ${
                    idx === activeItemIndex 
                      ? 'opacity-100 visible translate-y-0 relative z-10' 
                      : 'opacity-0 invisible absolute top-0 translate-y-12 z-0'
                  }`}
                >
                  <div className="text-[#004a99] font-black text-[10px] tracking-widest uppercase mb-4">Section {(idx + 1).toString().padStart(2, '0')}</div>
                  <h2 className="text-4xl lg:text-5xl font-semibold !leading-tight text-gray-900 mb-6 whitespace-pre-line">
                    {item.title}
                  </h2>
                  <div className={`w-12 h-[3px] bg-[#004a99] mb-8 transition-all duration-700 delay-100 no-print ${idx === activeItemIndex ? 'w-12 opacity-100' : 'w-0 opacity-0'}`}></div>
                  <p className="text-xl text-gray-800 leading-relaxed font-normal whitespace-pre-line">
                    {item.description}
                  </p>
                  
                  {/* 인쇄 시에는 텍스트 바로 아래에 이미지가 오도록 모바일용 레이아웃의 요소를 재활용하거나 인쇄 전용 표시 */}
                  <div className="hidden print:flex flex-col items-center w-full mt-10">
                    <div className="relative w-[280px] aspect-[9/19] bg-white rounded-[2.5rem] border-[4px] border-black overflow-hidden flex flex-col print-phone-frame">
                      <div className="relative z-30 w-full shrink-0">
                        <img src={STATUS_BAR_URL} alt="status bar" className="w-full h-auto block bg-white" />
                      </div>
                      <div className="relative flex-1 w-full bg-gray-50 overflow-hidden">
                         <img 
                            src={item.images[subImageIndices[idx]] || item.images[0]} 
                            alt={`${item.title}`} 
                            className="w-full h-full object-cover object-top" 
                          />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Phone Frame Area (Desktop View Only - Hidden on Print) */}
          <div className="flex-none flex flex-col items-center justify-center h-full no-print">
            <div className="flex flex-col items-center w-full transform translate-y-[54px]">
              <div className="relative w-full w-[300px] lg:w-[320px] aspect-[9/19] bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.12)] border-[8px] border-black overflow-hidden flex flex-col">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-b-3xl z-50"></div>
                
                <div className="relative z-40 w-full bg-white shrink-0">
                  <img src={STATUS_BAR_URL} alt="status bar" className="w-full h-auto block" draggable={false} />
                </div>

                <div className="relative flex-1 w-full bg-gray-50 overflow-hidden">
                  {items.map((item, itemIdx) => (
                    <div 
                      key={itemIdx}
                      ref={(el) => { if (itemIdx === activeItemIndex) scrollContainerRefs.current[itemIdx] = el; }}
                      onMouseDown={(e) => onMouseDown(e, itemIdx)}
                      onMouseLeave={() => setIsDragging(false)}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseMove={(e) => onMouseMove(e, itemIdx)}
                      className={`absolute inset-0 w-full h-full overflow-y-auto no-scrollbar transition-opacity duration-1000 ease-in-out ${
                        itemIdx === activeItemIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    >
                      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                      
                      {item.images.map((img, imgIdx) => (
                        <div
                          key={imgIdx}
                          className={`absolute inset-0 w-full h-full transform transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${
                            imgIdx === subImageIndices[itemIdx] 
                              ? 'opacity-100 scale-100 z-10' 
                              : 'opacity-0 scale-105 z-0'
                          }`}
                        >
                          <img 
                            src={img} 
                            alt={`Screen ${itemIdx}-${imgIdx}`} 
                            className="w-full h-auto block" 
                            draggable={false} 
                            style={{ objectPosition: 'top' }}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* 하단 페이징 컨트롤 */}
              <div className="flex items-center gap-6 mt-8 bg-white/80 px-5 py-2.5 rounded-full border border-gray-100 shadow-sm backdrop-blur-md z-20">
                <button onClick={(e) => handlePrevSubImage(e, activeItemIndex)} disabled={subImageIndices[activeItemIndex] === 0} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-10 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="text-xs font-bold text-gray-900 tabular-nums">
                  <span className="text-[#004a99]">{subImageIndices[activeItemIndex] + 1}</span>
                  <span className="mx-2 text-gray-200">/</span>
                  <span className="text-gray-400">{items[activeItemIndex]?.images.length}</span>
                </div>
                <button onClick={(e) => handleNextSubImage(e, activeItemIndex)} disabled={subImageIndices[activeItemIndex] === (items[activeItemIndex]?.images.length - 1)} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-10 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
