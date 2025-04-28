
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Product, Season } from '@/types';
import { Edit } from 'lucide-react';

interface SeasonProductsTableProps {
  season: Season | null;
  products: Product[];
  getProductMeetingInfo: (product: Product) => { current: number; total: number };
  onEditProduct: (product: Product) => void;
}

const SeasonProductsTable: React.FC<SeasonProductsTableProps> = ({ 
  season, 
  products, 
  getProductMeetingInfo,
  onEditProduct
}) => {
  const navigate = useNavigate();

  if (!season) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">מוצרים בעונה: {season.name}</h2>
      
      {products.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 border-b text-right">שם</th>
                <th className="py-2 px-4 border-b text-right">סוג</th>
                <th className="py-2 px-4 border-b text-right">מחיר</th>
                <th className="py-2 px-4 border-b text-right">תאריך התחלה</th>
                <th className="py-2 px-4 border-b text-right">תאריך סיום</th>
                <th className="py-2 px-4 border-b text-right">ימי פעילות</th>
                <th className="py-2 px-4 border-b text-right">שעת התחלה</th>
                <th className="py-2 px-4 border-b text-right">מפגשים</th>
                <th className="py-2 px-4 border-b text-right">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const meetingInfo = getProductMeetingInfo(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{product.name}</td>
                    <td className="py-2 px-4 border-b">{product.type}</td>
                    <td className="py-2 px-4 border-b">{product.price}</td>
                    <td className="py-2 px-4 border-b">{new Date(product.startDate).toLocaleDateString('he-IL')}</td>
                    <td className="py-2 px-4 border-b">{new Date(product.endDate).toLocaleDateString('he-IL')}</td>
                    <td className="py-2 px-4 border-b">{product.daysOfWeek?.join(', ') || '-'}</td>
                    <td className="py-2 px-4 border-b">{product.startTime || '-'}</td>
                    <td className="py-2 px-4 border-b">
                      {meetingInfo.current}/{meetingInfo.total}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/product/${product.id}/participants`)}
                        >
                          משתתפים
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEditProduct(product)}
                        >
                          <Edit className="h-4 w-4 ml-1" />
                          ערוך
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>אין מוצרים בעונה זו</p>
      )}
    </div>
  );
};

export default SeasonProductsTable;
