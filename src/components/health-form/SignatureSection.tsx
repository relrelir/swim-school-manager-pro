
import React from 'react';

const SignatureSection: React.FC = () => {
  return (
    <div className="mt-8 pt-4 border-t">
      <div className="flex flex-col gap-8">
        <div>
          <p className="font-semibold mb-1">חתימת ההורה/אפוטרופוס:</p>
          <div className="h-10 border-b border-dashed border-gray-400 w-64"></div>
        </div>
        <div>
          <p className="font-semibold mb-1">תאריך:</p>
          <div className="h-10 border-b border-dashed border-gray-400 w-32"></div>
        </div>
      </div>
    </div>
  );
};

export default SignatureSection;
