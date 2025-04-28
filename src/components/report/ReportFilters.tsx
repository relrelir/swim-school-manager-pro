
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Season, Product, PaymentStatus } from '@/types';

interface ReportFiltersProps {
  filters: {
    search: string;
    receiptNumber: string;
    seasonId: string;
    productId: string;
    paymentStatus: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    search: string;
    receiptNumber: string;
    seasonId: string;
    productId: string;
    paymentStatus: string;
  }>>;
  seasons: Season[];
  products: Product[];
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ filters, setFilters, seasons, products }) => {
  return (
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
  );
};

export default ReportFilters;
