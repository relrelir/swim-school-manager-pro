
import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { ReportTable } from '@/components/reports/ReportTable';
import { RegistrationWithDetails } from '@/types';

const ReportPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([]);
  const { getAllRegistrationsWithDetails } = useData();

  useEffect(() => {
    async function loadRegistrations() {
      try {
        setIsLoading(true);
        const allRegistrations = await getAllRegistrationsWithDetails();
        setRegistrations(allRegistrations);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadRegistrations();
  }, [getAllRegistrationsWithDetails]);

  if (isLoading) {
    return <div className="text-center py-10">טוען נתונים...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">דו״ח רישומים</h1>
      <ReportTable registrations={registrations} />
    </div>
  );
};

export default ReportPage;
