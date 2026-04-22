import React from 'react';
import CalculatorComponent from '../components/Calculator';
import type { TestScore, UserProfile, SessionRecord } from '../types';

interface CalculatorPageProps {
  profile: UserProfile;
  history: SessionRecord[];
  onSaveSession: (timestamp?: number, specificScores?: TestScore[]) => void;
}

const CalculatorPage: React.FC<CalculatorPageProps> = ({ profile, history, onSaveSession }) => {
  return (
    <div className="page-content">
      <CalculatorComponent
        profile={profile}
        history={history}
        onSaveSession={onSaveSession}
      />
    </div>
  );
};

export default CalculatorPage;
