
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { PaymentStatus, RegistrationWithDetails } from '@/types';
import { exportRegistrationsToCSV } from '@/utils/exportUtils';

const ReportPage: React.FC = () => {
  const { seasons, products, getAllRegistrationsWithDetails } = useData();
  const [filters, setFilters] = useState({
    search: '',
    receiptNumber: '',
    seasonId: 'all',  // Changed from empty string to 'all'
    productId: 'all',  // Changed from empty string to 'all'
    paymentStatus: 'all',  // Changed from empty string to 'all'
  });
  
  const allRegistrations = getAllRegistrationsWithDetails();
  
  // Apply filters to registrations
  const filteredRegistrations = allRegistrations.filter(registration => {
    // Search filter (name or ID)
    const nameMatch = `${registration.participant.firstName} ${registration.participant.lastName}`.toLowerCase().includes(filters.search.toLowerCase());
    const idMatch = registration.participant.idNumber.includes(filters.search);
    
    if (filters.search && !nameMatch && !idMatch) {
      return false;
    }
    
    // Receipt number filter
    if (filters.receiptNumber && !registration.receiptNumber.includes(filters.receiptNumber)) {
      return false;
    }
    
    // Season filter
    if (filters.seasonId && filters.seasonId !== 'all' && registration.season.id !== filters.seasonId) {
      return false;
    }
    
    // Product filter
    if (filters.productId && filters.productId !== 'all' && registration.product.id !== filters.productId) {
      return false;
    }
    
    // Payment status filter
    if (filters.paymentStatus && filters.paymentStatus !== 'all' && registration.paymentStatus !== filters.paymentStatus) {
      return false;
    }
    
    return true;
  });
  
  // Calculate payment status class
  const getStatusClassName = (status: PaymentStatus): string => {
    switch (status) {
      case 'מלא':
        return 'bg-status-paid bg-opacity-20 text-green-800';
      case 'חלקי':
        return 'bg-status-partial bg-opacity-20 text-yellow-800';
      case 'יתר':
        return 'bg-status-overdue bg-opacity-20 text-red-800';
      default:
        return '';
    }
  };

  // Calculate totals
  const totalRequiredAmount = filteredRegistrations.reduce((sum, reg) => sum + reg.requiredAmount, 0);
  const totalPaidAmount = filteredRegistrations.reduce((sum, reg) => sum + reg.paidAmount, 0);
  const totalRegistrations = filteredRegistrations.length;

  // Handle exporting to CSV
  const handleExport = () => {
    exportRegistrationsToCSV(
      filteredRegistrations,
      `swim-school-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">דו"ח מאוחד - כל הרישומים</h1>
        <Button onClick={handleExport}>ייצוא לאקסל (CSV)</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold">{totalRegistrations}</div>
            <div className="text-sm text-gray-500">סה"כ רישומים</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold">
              {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(totalRequiredAmount)}
            </div>
            <div className="text-sm text-gray-500">סה"כ לתשלום</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold">
              {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(totalPaidAmount)}
            </div>
            <div className="text-sm text-gray-500">סה"כ שולם</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="font-semibold text-lg mb-2">סינון וחיפוש</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Input
              placeholder="חיפוש לפי שם או ת.ז"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <Input
              placeholder="מספר קבלה"
              value={filters.receiptNumber}
              onChange={(e) => setFilters({ ...filters, receiptNumber: e.target.value })}
            />
          </div>
          <div>
            <Select
              value={filters.seasonId}
              onValueChange={(value) => setFilters({ ...filters, seasonId: value, productId: 'all' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="כל העונות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל העונות</SelectItem>
                {seasons.map((season) => (
                  <SelectItem key={season.id} value={season.id}>
                    {season.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={filters.productId}
              onValueChange={(value) => setFilters({ ...filters, productId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="כל המוצרים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל המוצרים</SelectItem>
                {products
                  .filter(product => !filters.seasonId || filters.seasonId === 'all' || product.seasonId === filters.seasonId)
                  .map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={filters.paymentStatus}
              onValueChange={(value) => setFilters({ ...filters, paymentStatus: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="כל סטטוסי התשלום" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל סטטוסי התשלום</SelectItem>
                <SelectItem value="מלא">תשלום מלא</SelectItem>
                <SelectItem value="חלקי">תשלום חלקי</SelectItem>
                <SelectItem value="יתר">תשלום יתר</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredRegistrations.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">לא נמצאו רישומים מתאימים לסינון שנבחר.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם מלא</TableHead>
                <TableHead>ת.ז</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>עונה</TableHead>
                <TableHead>מוצר</TableHead>
                <TableHead>סוג מוצר</TableHead>
                <TableHead>סכום לתשלום</TableHead>
                <TableHead>סכום ששולם</TableHead>
                <TableHead>מספר קבלה</TableHead>
                <TableHead>סטטוס תשלום</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>{`${registration.participant.firstName} ${registration.participant.lastName}`}</TableCell>
                  <TableCell>{registration.participant.idNumber}</TableCell>
                  <TableCell>{registration.participant.phone}</TableCell>
                  <TableCell>{registration.season.name}</TableCell>
                  <TableCell>{registration.product.name}</TableCell>
                  <TableCell>{registration.product.type}</TableCell>
                  <TableCell>{Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(registration.requiredAmount)}</TableCell>
                  <TableCell>{Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(registration.paidAmount)}</TableCell>
                  <TableCell>{registration.receiptNumber}</TableCell>
                  <TableCell className={`font-semibold ${getStatusClassName(registration.paymentStatus)}`}>
                    {registration.paymentStatus}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
