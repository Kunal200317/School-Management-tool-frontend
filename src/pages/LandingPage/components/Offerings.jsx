import React from 'react';
import { Heart, Sun, Flame, BookOpen } from 'lucide-react';

export default function Offerings() {
  const values = [
    {
      title: 'LOVE',
      description: 'Nurturing a spirit of compassion and charity in every student.',
      icon: Heart,
      bg: 'bg-[#eef8ff]',
      border: 'border-[#bce2ff]',
      iconColor: 'text-[#1d90ff]',
    },
    {
      title: 'MERIT',
      description: 'Achieving academic excellence through discipline and hard work.',
      icon: Sun,
      bg: 'bg-[#fffdf0]',
      border: 'border-[#ffe9a3]',
      iconColor: 'text-[#dca534]',
    },
    {
      title: 'SERVICE',
      description: 'Leading through the light of service to God and humanity.',
      icon: Flame,
      bg: 'bg-[#fff0f5]',
      border: 'border-[#ffd1e1]',
      iconColor: 'text-[#ff4081]',
    },
    {
      title: 'KNOWLEDGE',
      description: 'Opening the doors of the mind through holistic education.',
      icon: BookOpen,
      bg: 'bg-[#f0fff4]',
      border: 'border-[#b7ffd2]',
      iconColor: 'text-[#2e7d32]',
    },
  ];

  return (
    <section id="values" className="py-20 sm:py-28 bg-[#FBFAF6]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 
            className="text-3xl sm:text-4xl font-extrabold tracking-widest text-[#0a1e3f] uppercase"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            OUR CORE VALUES
          </h2>
          <div className="w-24 h-1 bg-[#c59b27] mx-auto mt-2" />
          <p className="text-sm sm:text-base italic font-serif text-slate-500 pt-2">
            Four quadrants of our crest — four promises we make to every child.
          </p>
        </div>

        {/* Card Grid with Gold Frame Border wrapper */}
        <div className="relative border-3 border-[#c59b27] p-8 sm:p-12 bg-white shadow-xl">
          {/* Double-line Corner bracket accents */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#c59b27]" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#c59b27]" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#c59b27]" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#c59b27]" />

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((val) => {
              const Icon = val.icon;
              return (
                <div 
                  key={val.title}
                  className={`flex flex-col items-center text-center p-8 rounded-none border-2 ${val.bg} ${val.border} transition-transform duration-300 hover:-translate-y-1 shadow-xs`}
                >
                  {/* Icon */}
                  <div className={`mb-6 p-3 rounded-full bg-white shadow-sm border border-slate-100 ${val.iconColor}`}>
                    <Icon className="h-7 w-7 stroke-[1.8]" />
                  </div>
                  
                  {/* Title */}
                  <h3 
                    className="text-lg font-bold tracking-wider text-[#0a1e3f] mb-3"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {val.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-sans font-medium">
                    {val.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Navy Strip */}
        <div 
          className="bg-[#0a1e3f] border-b-2 border-[#c59b27] py-3.5 px-8 text-center max-w-lg mx-auto mt-12 shadow-lg"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          <span className="text-xs sm:text-sm font-bold text-[#c59b27] tracking-[0.35em] uppercase">
            LOVE · MERIT · SERVICE
          </span>
        </div>

      </div>
    </section>
  );
}

