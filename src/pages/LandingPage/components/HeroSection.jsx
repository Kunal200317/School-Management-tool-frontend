import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';

export default function HeroSection() {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 380) {
        setBroken(true);
      } else {
        setBroken(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden py-16 px-4 sm:px-6 lg:px-8 bg-[#0a1e3f]"
      style={{ background: 'radial-gradient(circle at center, #0c2652 0%, #040d1c 100%)' }}
    >
      {/* Custom Stylesheet block for keyframes */}
      <style>{`
        @keyframes sign-break-swing {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(-56deg); }
          30% { transform: rotate(-16deg); }
          45% { transform: rotate(-44deg); }
          60% { transform: rotate(-26deg); }
          75% { transform: rotate(-36deg); }
          90% { transform: rotate(-30deg); }
          100% { transform: rotate(-32deg); }
        }
        .sign-broken {
          animation: sign-break-swing 3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          transform-origin: 88% 0%;
        }
        .sign-normal {
          transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
          transform: rotate(0deg);
          transform-origin: 88% 0%;
        }
      `}</style>

      {/* Background glowing elements */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-amber-500/10 blur-[90px] z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[90px] z-0"></div>

      {/* Gold Framed Container Wrapper with Corner Brackets */}
      <div className="relative w-full max-w-5xl mx-auto border border-[#c59b27]/40 p-8 sm:p-12 lg:p-16 flex flex-col items-center justify-center z-10">
        
        {/* Double-line Corner bracket accents */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#c59b27]" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#c59b27]" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#c59b27]" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#c59b27]" />

        {/* Central Circular School Crest */}
        <div className="mb-8 flex h-[160px] w-[160px] sm:h-[200px] sm:w-[200px] items-center justify-center rounded-full bg-white p-[3px] shadow-[0_12px_36px_rgba(0,0,0,0.4)] border-4 border-[#c59b27] overflow-hidden transition-transform duration-500 hover:scale-105">
          <img src="/logo.jpg" alt="Loyola School Crest Logo" className="h-full w-full object-contain rounded-full" />
        </div>

        {/* Main Title Box with Gold Borders */}
        <div className="w-full max-w-4xl text-center space-y-4 border border-[#c59b27]/30 py-8 px-6 sm:px-12 bg-[#051124]/40 backdrop-blur-xs">
          
          {/* Subtitle */}
          <span 
            className="block text-xs sm:text-sm font-bold tracking-[0.3em] text-[#c59b27] uppercase"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            IN PURSUIT OF EXCELLENCE
          </span>

          {/* Huge Main Header */}
          <h1 
            className="font-serif text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-wider text-white leading-tight uppercase"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            LOYOLA ENGLISH <br />
            MEDIUM SCHOOL
          </h1>

        </div>

        {/* Lalpania Sub-bar with Hanging Chain / Rope simulation */}
        <div className="relative max-w-xl w-full mt-10">
          {/* Left hanging chain: splits/dangles loose if broken */}
          <div 
            className={`absolute left-[12%] -top-10 w-[2px] h-10 bg-[#c59b27] transition-all duration-500 origin-top ${
              broken ? 'h-5 rotate-[-25deg] opacity-40 scale-y-50' : 'h-10'
            }`} 
          />
          {/* Right hanging chain: stays fully intact */}
          <div className="absolute right-[12%] -top-10 w-[2px] h-10 bg-[#c59b27]" />
          
          {/* The Board itself */}
          <div 
            className={`bg-[#051124] border-x-[3px] border-[#c59b27] py-3.5 px-8 text-center shadow-2xl relative select-none cursor-default ${
              broken ? 'sign-broken' : 'sign-normal'
            }`}
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {/* Small gold eyelet screws on the board where chains attach */}
            <div className="absolute left-[12%] -top-1 w-2 h-2 rounded-full border border-[#c59b27] bg-[#051124]" />
            <div className="absolute right-[12%] -top-1 w-2 h-2 rounded-full border border-[#c59b27] bg-[#051124]" />

            <span className="text-[10px] sm:text-xs font-bold text-slate-200 tracking-[0.25em] uppercase">
              LALPANIA · BOKARO · JHARKHAND
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-10" style={{ fontFamily: "'Cinzel', serif" }}>
          <Link 
            to="/login" 
            className="group inline-flex items-center justify-center gap-2.5 rounded-none bg-[#c59b27] hover:bg-[#b08920] px-10 py-4 text-xs sm:text-sm font-bold text-[#0a1e3f] tracking-[0.2em] transition-all duration-200 shadow-xl active:scale-97 cursor-pointer"
          >
            <Shield className="h-4.5 w-4.5" />
            <span>ADMIN PORTAL</span>
            <ArrowRight className="h-4.5 w-4.5 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}
