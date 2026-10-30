import React from 'react';

export default function AboutVision() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column - Text Details (7 cols) */}
          <div className="space-y-8 lg:col-span-7">
            <div className="space-y-3">
              <span 
                className="text-xs font-bold tracking-[0.25em] text-[#c59b27] uppercase block"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                ABOUT THE SCHOOL
              </span>
              <h3 
                className="text-3xl sm:text-4xl font-extrabold tracking-wide text-[#0a1e3f] leading-tight"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                A HERITAGE OF <span className="text-[#c59b27]">WISDOM</span>
              </h3>
            </div>
            
            <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed font-sans font-medium">
              Loyola English Medium School, Lalpania, stands as a beacon of academic rigor and moral integrity. Our curriculum is designed to challenge the intellect while nurturing the soul, guided by the timeless values of our crest.
            </p>

            <div className="space-y-6 pt-2">
              {/* Vision segment */}
              <div className="border-l-4 border-[#c59b27] pl-4 space-y-1">
                <span 
                  className="block text-[11px] font-bold tracking-widest text-[#c59b27] uppercase"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  OUR VISION
                </span>
                <p className="text-xs sm:text-sm text-slate-600 font-sans font-medium">
                  To form leaders who are intellectually competent, spiritually mature, and socially responsible.
                </p>
              </div>

              {/* Mission segment */}
              <div className="border-l-4 border-[#c59b27] pl-4 space-y-1">
                <span 
                  className="block text-[11px] font-bold tracking-widest text-[#c59b27] uppercase"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  OUR MISSION
                </span>
                <p className="text-xs sm:text-sm text-slate-600 font-sans font-medium">
                  Providing holistic education that empowers every student from Nursery to Class 10 to reach their highest potential.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Crest Card (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative border-4 border-[#0a1e3f] bg-white p-6 w-full max-w-[340px] shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
              
              {/* White background frame with gold border */}
              <div className="border-2 border-[#c59b27] p-6 flex justify-center items-center bg-white shadow-inner">
                <img 
                  src="/logo.jpg" 
                  alt="Loyola Lalpania Crest Logo" 
                  className="w-full h-auto object-contain aspect-square"
                />
              </div>

              {/* Overlapping badge in bottom-left */}
              <div 
                className="absolute -bottom-5 -left-5 bg-[#0a1e3f] border-2 border-[#c59b27] py-3 px-5 text-center shadow-lg"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <span className="block text-2xl font-extrabold text-[#c59b27] leading-none">L</span>
                <span className="block text-[9px] font-bold text-white tracking-[0.2em] mt-1">LALPANIA</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

