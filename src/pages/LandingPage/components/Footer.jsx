import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t-3 border-[#c59b27] bg-[#051124] py-16 text-[#e2e8f0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:items-center">
          
          {/* Col 1: Logo, Name & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {/* School Crest Logo Container */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-[1px] shadow-md border border-[#c59b27]/30 overflow-hidden">
                <img src="/logo.jpg" alt="Loyola School Crest" className="h-full w-full object-contain rounded-full" />
              </div>
              <span className="text-lg font-bold text-[#c59b27] uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>
                LOYOLA SCHOOL
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed max-w-[340px] font-sans font-medium">
              An institution dedicated to the development of the human mind and soul — serving the community of Lalpania, Bokaro with faith, knowledge and character.
            </p>
          </div>

          {/* Col 2: Central Motto Box */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="border border-[#c59b27]/40 bg-[#06142c]/50 p-6 max-w-xs w-full text-center relative">
              {/* Double-line Corner bracket accents */}
              <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-[#c59b27]" />
              <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-[#c59b27]" />
              <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-[#c59b27]" />
              <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-[#c59b27]" />

              <span 
                className="block text-[10px] font-bold text-[#c59b27] tracking-[0.25em] uppercase mb-2"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                THE MOTTO
              </span>
              <span 
                className="block text-md font-extrabold text-white tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                LOVE · MERIT · SERVICE
              </span>
            </div>
            
            <div className="mt-4 flex items-center gap-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <span className="w-6 h-[1px] bg-[#c59b27]/40" />
              <span className="text-[9px] font-bold text-[#c59b27] tracking-[0.2em] uppercase">
                BOKARO · JHARKHAND
              </span>
              <span className="w-6 h-[1px] bg-[#c59b27]/40" />
            </div>
          </div>

          {/* Col 3: Quick Links & Portal Entry */}
          <div className="space-y-6 md:pl-8 flex flex-col md:items-start">
            <div className="space-y-3" style={{ fontFamily: "'Cinzel', serif" }}>
              <h4 className="text-sm font-bold text-[#c59b27] tracking-wider uppercase">QUICK LINKS</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#about" className="text-xs font-bold tracking-wider text-slate-300 transition-colors hover:text-[#c59b27]">
                    About the School
                  </a>
                </li>
                <li>
                  <a href="#facilities" className="text-xs font-bold tracking-wider text-slate-300 transition-colors hover:text-[#c59b27]">
                    Facilities
                  </a>
                </li>
                <li>
                  <Link to="/login" className="text-xs font-bold tracking-wider text-slate-300 transition-colors hover:text-[#c59b27]">
                    Admin Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Enter Portal Gold Button */}
            <div style={{ fontFamily: "'Cinzel', serif" }}>
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center gap-1.5 rounded-none bg-[#c59b27] hover:bg-[#b08920] px-6 py-3 text-xs font-bold text-[#0a1e3f] tracking-widest transition-all duration-200 active:scale-97 shadow-md"
              >
                <span>+ ENTER PORTAL</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Footer Bottom copyright */}
        <div className="mt-16 border-t border-slate-800/80 pt-8 text-center" style={{ fontFamily: "'Cinzel', serif" }}>
          <p className="text-[10px] sm:text-xs font-bold text-slate-600 tracking-[0.25em] uppercase">
            &copy; {currentYear} · LOVE · MERIT · SERVICE · KNOWLEDGE
          </p>
        </div>

      </div>
    </footer>
  );
}


