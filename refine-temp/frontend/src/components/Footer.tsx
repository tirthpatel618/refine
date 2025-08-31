import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="text-center text-white/60 text-sm mt-12">
      built by{' '}
      <a
        href="https://tirthpatel.me"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-white/80 transition-colors"
      >
        Tirth Patel
      </a>
    </footer>
  );
};

export default Footer;
