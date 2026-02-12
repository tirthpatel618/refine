import { useParams, Navigate } from 'react-router-dom';
import MathGame from '../components/MathGame';
import type { Mode } from '../types';

const validModes: Mode[] = ['addition', 'subtraction', 'multiplication', 'division', 'mixed'];

export default function PlayPage() {
  const { mode } = useParams<{ mode: string }>();

  if (!mode || !validModes.includes(mode as Mode)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <MathGame mode={mode as Mode} />
    </div>
  );
}
