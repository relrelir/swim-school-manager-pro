
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Season, Product } from '@/types';
import { ReportFilters } from '@/utils/reportFilters';

interface ReportFiltersProps {
  filters: ReportFilters;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilters>>;
  seasons: Season[];
  products: Product[];
}

const ReportFiltersComponent: React.FC<ReportFiltersProps> = ({ filters, setFilters, seasons, products }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">חיפוש (שם/ת.ז./טלפון)</label>
          <Input 
            value={filters.search} 
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="חיפוש..."
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">מספר קבלה</label>
          <Input 
            value={filters.receiptNumber} 
            onChange={e => setFilters(prev => ({ ...prev, receiptNumber: e.target.value }))}
            placeholder="מספר קבלה..."
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">סטטוס תשלום</label>
          <Select
            value={filters.paymentStatus}
            onValueChange={value => setFilters(prev => ({ ...prev, paymentStatus: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="כל הסטטוסים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="מלא">מלא</SelectItem>
              <SelectItem value="חלקי">חלקי</SelectItem>
              <SelectItem value="יתר">יתר</SelectItem>
              <SelectItem value="מלא / הנחה">מלא / הנחה</SelectItem>
              <SelectItem value="חלקי / הנחה">חלקי / הנחה</SelectItem>
              <SelectItem value="הנחה">הנחה</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">עונה</label>
          <Select
            value={filters.seasonId}
            onValueChange={value => setFilters(prev => ({ ...prev, seasonId: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="כל העונות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל העונות</SelectItem>
              {seasons.map(season => (
                <SelectItem key={season.id} value={season.id}>
                  {season.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">מוצר</label>
          <Select
            value={filters.productId}
            onValueChange={value => setFilters(prev => ({ ...prev, productId: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="כל המוצרים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל המוצרים</SelectItem>
              {products.map(product => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ReportFiltersComponent;
