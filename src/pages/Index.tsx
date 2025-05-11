
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // מעבר אוטומטי לדף העונות
    navigate('/');
  }, [navigate]);

  return null; // אין צורך להציג משהו מאחר ונעשה ניווט אוטומטי
};

export default Index;
