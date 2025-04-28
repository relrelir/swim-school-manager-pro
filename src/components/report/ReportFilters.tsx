
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportFilters } from '@/utils/reportFilters';
import { Season, Product } from '@/types';

interface ReportFiltersComponentProps {
  filters: ReportFilters;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilters>>;
  seasons: Season[];
  products: Product[];
}

const ReportFiltersComponent: React.FC<ReportFiltersComponentProps> = ({ 
  filters, 
  setFilters, 
  seasons, 
  products 
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h2 className="font-semibold mb-4">סינון רישומים</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search by name or ID */}
        <div className="space-y-2">
          <Label htmlFor="search">חיפוש לפי שם/ת.ז</Label>
          <Input
            id="search"
            placeholder="הקלד שם או ת.ז"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        
        {/* Search by receipt number */}
        <div className="space-y-2">
          <Label htmlFor="receipt">חיפוש לפי מספר קבלה</Label>
          <Input
            id="receipt"
            placeholder="הקלד מספר קבלה"
            value={filters.receiptNumber}
            onChange={(e) => setFilters({ ...filters, receiptNumber: e.target.value })}
          />
        </div>
        
        {/* Filter by season */}
        <div className="space-y-2">
          <Label htmlFor="season">סינון לפי עונה</Label>
          <Select
            value={filters.seasonId}
            onValueChange={(value) => setFilters({ ...filters, seasonId: value })}
          >
            <SelectTrigger id="season">
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
        
        {/* Filter by product */}
        <div className="space-y-2">
          <Label htmlFor="product">סינון לפי מוצר</Label>
          <Select
            value={filters.productId}
            onValueChange={(value) => setFilters({ ...filters, productId: value })}
          >
            <SelectTrigger id="product">
              <SelectValue placeholder="כל המוצרים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל המוצרים</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Filter by payment status */}
        <div className="space-y-2">
          <Label htmlFor="status">סינון לפי סטטוס תשלום</Label>
          <Select
            value={filters.paymentStatus}
            onValueChange={(value) => setFilters({ ...filters, paymentStatus: value })}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="כל הסטטוסים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="מלא">מלא</SelectItem>
              <SelectItem value="חלקי">חלקי</SelectItem>
              <SelectItem value="יתר">יתר</SelectItem>
              <SelectItem value="הנחה">הנחה</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ReportFiltersComponent;
