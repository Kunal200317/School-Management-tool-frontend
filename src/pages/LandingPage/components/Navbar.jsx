import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'ABOUT', href: '#about' },
    { label: 'VALUES', href: '#values' },
    { label: 'FACILITIES', href: '#facilities' },
    { label: 'CONTACT', href: '#contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0a1e3f] border-b-3 border-[#c59b27] shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            {/* School Crest Logo Container */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-[1px] shadow-md border border-[#c59b27]/30 overflow-hidden">
              <img src="/logo.jpg" alt="Loyola School Crest" className="h-full w-full object-contain rounded-full" />
            </div>
            <div className="flex flex-col" style={{ fontFamily: "'Cinzel', serif" }}>
              <span className="text-[15px] sm:text-[17px] font-bold tracking-wider text-white leading-none">
                LOYOLA ENGLISH MEDIUM SCHOOL
              </span>
              <span className="text-[9px] font-semibold tracking-[0.2em] text-[#c59b27] mt-1 uppercase">
                LALPANIA · BOKARO
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8" style={{ fontFamily: "'Cinzel', serif" }}>
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[13px] font-bold tracking-widest text-[#e2e8f0] transition-colors duration-200 hover:text-[#c59b27] hover:underline underline-offset-4"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Admin Login Button */}
          <div className="hidden md:block" style={{ fontFamily: "'Cinzel', serif" }}>
            <Link 
              to="/login" 
              className="flex items-center gap-1.5 rounded-lg bg-[#c59b27] hover:bg-[#b08920] px-5 py-2.5 text-xs font-bold text-[#0a1e3f] tracking-widest transition-all duration-200 active:scale-98 shadow-md"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>LOGIN</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[#c59b27]/30 bg-[#0a1e3f]/95 backdrop-blur-md" style={{ fontFamily: "'Cinzel', serif" }}>
          <div className="space-y-1 px-4 py-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-bold tracking-widest text-slate-200 hover:bg-slate-800 hover:text-[#c59b27]"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 border-t border-slate-700/50">
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)} 
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-[#c59b27] hover:bg-[#b08920] py-3 text-sm font-bold text-[#0a1e3f] tracking-widest shadow-lg"
              >
                <Shield className="h-4 w-4" />
                <span>LOGIN PORTAL</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

