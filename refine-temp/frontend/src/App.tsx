import React from 'react';
import Header from './components/Header';
import EmailCapture from './components/EmailCapture';
import MathGame from './components/MathGame';
import Footer from './components/Footer';
import { Analytics } from "@vercel/analytics/react";
import Squares from './components/Squares';

const App: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <Squares
          speed={0.1}
          squareSize={50}
          direction="diagonal"
          borderColor="rgba(230, 200, 255, 0.3)"   // soft lavender tone
          hoverFillColor="rgba(140, 70, 200, 0.4)" // deeper purple hover        
        />
      </div>

      {/* ✅ Foreground Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl text-white">
        <Header />
        <EmailCapture />
        <div className="mb-12">
          <MathGame />
        </div>
        <Footer />
        <Analytics />
      </div>
    </div>
  );
};

export default App;
