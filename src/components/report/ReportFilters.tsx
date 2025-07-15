
import React from 'react';
import { Input } from '@/components/ui/input';
import { Season, Product, Pool } from '@/types';
import { ReportFilters } from '@/utils/reportFilters';
import { MultiSelect, Option } from '@/components/ui/multi-select';

interface ReportFiltersProps {
  filters: ReportFilters;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilters>>;
  seasons: Season[];
  products: Product[];
  pools: Pool[];
}

const ReportFiltersComponent: React.FC<ReportFiltersProps> = ({ filters, setFilters, seasons, products, pools }) => {
  const paymentStatusOptions: Option[] = [
    { label: "הכל", value: "all" },
    { label: "מלא", value: "מלא" },
    { label: "חלקי", value: "חלקי" },
    { label: "יתר", value: "יתר" },
    { label: "מלא / הנחה", value: "מלא / הנחה" },
    { label: "חלקי / הנחה", value: "חלקי / הנחה" },
    { label: "הנחה", value: "הנחה" },
  ];

  const seasonOptions: Option[] = [
    { label: "כל העונות", value: "all" },
    ...seasons.map(season => ({
      label: season.name,
      value: season.id || 'no-id'
    }))
  ];

  const productOptions: Option[] = [
    { label: "כל המוצרים", value: "all" },
    ...products.map(product => ({
      label: product.name,
      value: product.id || 'no-id'
    }))
  ];

  const poolOptions: Option[] = [
    { label: "כל הבריכות", value: "all" },
    ...pools.map(pool => ({
      label: pool.name,
      value: pool.id || 'no-id'
    }))
  ];

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
          <MultiSelect
            options={paymentStatusOptions}
            selected={filters.paymentStatus}
            onChange={selected => setFilters(prev => ({ ...prev, paymentStatus: selected }))}
            placeholder="בחר סטטוס תשלום"
            className="w-full"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">עונה</label>
          <MultiSelect
            options={seasonOptions}
            selected={filters.seasonId}
            onChange={selected => setFilters(prev => ({ ...prev, seasonId: selected }))}
            placeholder="בחר עונות"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">מוצר</label>
          <MultiSelect
            options={productOptions}
            selected={filters.productId}
            onChange={selected => setFilters(prev => ({ ...prev, productId: selected }))}
            placeholder="בחר מוצרים"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">בריכה</label>
          <MultiSelect
            options={poolOptions}
            selected={filters.poolId}
            onChange={selected => setFilters(prev => ({ ...prev, poolId: selected }))}
            placeholder="בחר בריכות"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportFiltersComponent;
