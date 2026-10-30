import React from 'react';
import { BookOpen, FlaskConical, Trophy } from 'lucide-react';

export default function Facilities() {
  const items = [
    {
      title: 'MODERN LIBRARY',
      description: 'A sanctuary for research and reading, housing thousands of titles across diverse genres.',
      icon: BookOpen,
    },
    {
      title: 'SCIENCE CENTER',
      description: 'Equipped with specialized laboratories for Physics, Chemistry and Biological studies.',
      icon: FlaskConical,
    },
    {
      title: 'SPORTS COMPLEX',
      description: 'Encouraging physical agility and team spirit through diverse indoor and outdoor sports.',
      icon: Trophy,
    },
  ];

  return (
    <section id="facilities" className="py-20 sm:py-28 bg-[#0a1e3f]" style={{ background: 'radial-gradient(circle at center, #0c2652 0%, #040d1c 100%)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 
            className="text-3xl sm:text-4xl font-extrabold tracking-widest text-white uppercase"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            CAMPUS FACILITIES
          </h2>
          <div className="w-24 h-1 bg-[#c59b27] mx-auto mt-2" />
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="border border-[#c59b27]/30 bg-[#051124]/50 p-8 sm:p-10 flex flex-col items-start text-left shadow-xl transition-all duration-300 hover:border-[#c59b27]/60 hover:-translate-y-1"
              >
                {/* Gold Outlined Icon Box */}
                <div className="border border-[#c59b27] p-2.5 w-12 h-12 flex items-center justify-center text-[#c59b27] bg-[#0a1e3f]/40 mb-6">
                  <Icon className="h-6 w-6 stroke-[1.8]" />
                </div>

                {/* Title */}
                <h3 
                  className="text-md sm:text-lg font-bold tracking-wider text-white"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-4 font-sans font-medium">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Row with Gold Borders */}
        <div className="border-y border-[#c59b27]/30 py-10 mt-20 max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center" style={{ fontFamily: "'Cinzel', serif" }}>
            <div className="space-y-1">
              <span className="block text-3xl sm:text-5xl font-extrabold text-[#c59b27] tracking-wider">500+</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-300 tracking-[0.25em] uppercase block">Students</span>
            </div>
            <div className="space-y-1 border-x border-[#c59b27]/20">
              <span className="block text-3xl sm:text-5xl font-extrabold text-[#c59b27] tracking-wider">30+</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-300 tracking-[0.25em] uppercase block">Teachers</span>
            </div>
            <div className="space-y-1">
              <span className="block text-3xl sm:text-5xl font-extrabold text-[#c59b27] tracking-wider">13</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-300 tracking-[0.25em] uppercase block">Classes</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
