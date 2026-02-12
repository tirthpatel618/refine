import { useNavigate } from 'react-router-dom';
import type { Mode } from '../types';

const modes: { mode: Mode; label: string; symbol: string; description: string }[] = [
  { mode: 'addition', label: 'Addition', symbol: '+', description: 'Sharpen your addition skills' },
  { mode: 'subtraction', label: 'Subtraction', symbol: '\u2212', description: 'Practice quick subtraction' },
  { mode: 'multiplication', label: 'Multiplication', symbol: '\u00d7', description: 'Build multiplication speed' },
  { mode: 'division', label: 'Division', symbol: '\u00f7', description: 'Master mental division' },
  { mode: 'mixed', label: 'Mixed', symbol: '?', description: 'All operations, random order' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose your practice</h1>
        <p className="text-gray-500">Select an operation to get started</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {modes.map(({ mode, label, symbol, description }) => (
          <button
            key={mode}
            onClick={() => navigate(`/play/${mode}`)}
            className="group flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-sm transition-all text-left"
          >
            <span className="text-4xl font-mono font-bold text-gray-300 group-hover:text-gray-900 transition-colors">
              {symbol}
            </span>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
