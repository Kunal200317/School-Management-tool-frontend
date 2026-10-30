import React from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import Offerings from './components/Offerings.jsx';
import AboutVision from './components/AboutVision.jsx';
import Facilities from './components/Facilities.jsx';
import Footer from './components/Footer.jsx';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FBFAF6] flex flex-col justify-between selection:bg-amber-100 selection:text-amber-800">
      <div>
        <Navbar />
        <main>
          <HeroSection />
          <Offerings />
          <AboutVision />
          <Facilities />
        </main>
      </div>
      <Footer />
    </div>
  );
}
