import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { exportRegistrationsToCSV } from '@/utils/exportUtils';
import { ReportFilters } from '@/utils/reportFilters';
import ReportSummaryCards from '@/components/report/ReportSummaryCards';
import RegistrationsTable from '@/components/report/RegistrationsTable';
import ReportFiltersComponent from '@/components/report/ReportFilters';
import { filterRegistrations } from '@/utils/reportFilters';
import { FileDown, Filter } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ReportPage: React.FC = () => {
  const { seasons, products, getAllRegistrationsWithDetails } = useData();
  const [filters, setFilters] = useState<ReportFilters>({
    search: '',
    receiptNumber: '',
    seasonId: 'all',
    productId: 'all',
    paymentStatus: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const allRegistrations = getAllRegistrationsWithDetails();
  const filteredRegistrations = filterRegistrations(allRegistrations, filters);

  // Handle exporting to CSV
  const handleExport = () => {
    if (filteredRegistrations.length === 0) {
      toast({
        title: "אין נתונים לייצוא",
        description: "לא נמצאו רשומות התואמות את הפילטרים",
        variant: "destructive",
      });
      return;
    }
    
    try {
      exportRegistrationsToCSV(
        filteredRegistrations,
        `דוח-רישומים-${new Date().toISOString().slice(0, 10)}.csv`
      );
      
      toast({
        title: "הייצוא הושלם בהצלחה",
        description: `יוצאו ${filteredRegistrations.length} רשומות לקובץ CSV`,
      });
    } catch (error) {
      toast({
        title: "שגיאה בייצוא",
        description: "אירעה שגיאה בעת ייצוא הנתונים",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold font-alef">דו"ח מאוחד - כל הרישומים</h1>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            <span>{showFilters ? 'הסתר פילטרים' : 'הצג פילטרים'}</span>
          </Button>
          
          <Button 
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            <span>ייצוא לאקסל (CSV)</span>
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-muted/40 p-4 rounded-lg border animate-scale-in">
          <ReportFiltersComponent 
            filters={filters} 
            setFilters={setFilters} 
            seasons={seasons} 
            products={products} 
          />
        </div>
      )}

      <ReportSummaryCards registrations={filteredRegistrations} />
      
      <div className="bg-white rounded-lg shadow-card">
        <RegistrationsTable 
          registrations={filteredRegistrations} 
        />
      </div>
    </div>
  );
};

export default ReportPage;
