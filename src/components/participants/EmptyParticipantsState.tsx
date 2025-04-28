
import React from 'react';

const EmptyParticipantsState: React.FC = () => {
  return (
    <div className="text-center p-10 bg-gray-50 rounded-lg">
      <p className="text-lg text-gray-500">אין משתתפים רשומים. הוסף משתתף חדש כדי להתחיל.</p>
    </div>
  );
};

export default EmptyParticipantsState;
