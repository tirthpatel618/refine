import React from 'react';
import Header from './components/Header';
import EmailCapture from './components/EmailCapture';
import MathGame from './components/MathGame';
import Footer from './components/Footer';
import { Analytics } from "@vercel/analytics/next"
//import './styles/mathBackground.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 relative">
      <Analytics />
      <div className="math-background"></div>
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        <Header />
        <EmailCapture />
        <div className="mb-12">
          <MathGame />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default App;