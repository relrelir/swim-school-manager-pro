
import React from 'react';

const EmptyProductsState: React.FC = () => {
  return (
    <div className="text-center p-10 bg-gray-50 rounded-lg">
      <p className="text-lg text-gray-500">אין מוצרים בעונה זו. הוסף מוצר חדש כדי להתחיל.</p>
    </div>
  );
};

export default EmptyProductsState;
