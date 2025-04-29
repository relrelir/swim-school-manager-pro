
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useData } from "@/context/DataContext";
import { useSeasonProducts } from '@/hooks/useSeasonProducts';
import EditProductDialog from '@/components/products/EditProductDialog';
import AddSeasonDialog from '@/components/seasons/AddSeasonDialog';
import SeasonList from '@/components/seasons/SeasonList';
import { Edit, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Product } from '@/types';
import { format } from 'date-fns';

export default function SeasonPage() {
  const { seasons } = useData();
  const navigate = useNavigate();
  const { 
    season, 
    seasonProducts, 
    editingProduct, 
    isEditDialogOpen, 
    setIsEditDialogOpen, 
    handleEditProduct, 
    handleUpdateProduct,
    getProductMeetingInfo
  } = useSeasonProducts();

  const [isAddSeasonOpen, setIsAddSeasonOpen] = useState(false);
  const [seasonProductCounts, setSeasonProductCounts] = useState<Record<string, number>>({});
  
  // Sorting and filtering state
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState('');

  // Calculate product counts for each season
  useEffect(() => {
    const productCounts: Record<string, number> = {};
    
    seasons.forEach(season => {
      const productsForSeason = seasonProducts.filter(p => p.seasonId === season.id);
      productCounts[season.id] = productsForSeason.length;
    });
    
    setSeasonProductCounts(productCounts);
  }, [seasons, seasonProducts]);

  // Handle sorting
  const handleSort = (field: keyof Product) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter and sort products
  const filteredAndSortedProducts = seasonProducts
    .filter(product => 
      filter === '' || 
      product.name.toLowerCase().includes(filter.toLowerCase()) ||
      product.type.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Format price with ILS symbol
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">עונות שחייה</h1>
        <Button onClick={() => setIsAddSeasonOpen(true)}>הוסף עונה</Button>
      </div>
      
      <SeasonList 
        seasons={seasons} 
        seasonProducts={seasonProductCounts} 
      />

      {season && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">מוצרים בעונה: {season.name}</h2>
            <Button onClick={() => navigate(`/season/${season.id}/products`)}>הוסף מוצר</Button>
          </div>

          {/* Search and Filter */}
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              placeholder="חיפוש לפי שם או סוג..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pr-10"
            />
          </div>

          {seasonProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center justify-end">
                        שם {sortField === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center justify-end">
                        סוג {sortField === 'type' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center justify-end">
                        מחיר {sortField === 'price' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort('startDate')}
                    >
                      <div className="flex items-center justify-end">
                        תאריך התחלה {sortField === 'startDate' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort('endDate')}
                    >
                      <div className="flex items-center justify-end">
                        תאריך סיום {sortField === 'endDate' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>ימי פעילות</TableHead>
                    <TableHead>שעת התחלה</TableHead>
                    <TableHead>מפגשים</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedProducts.map((product) => {
                    const meetingInfo = getProductMeetingInfo(product);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.type}</TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>{formatDate(product.startDate)}</TableCell>
                        <TableCell>{formatDate(product.endDate)}</TableCell>
                        <TableCell>{product.daysOfWeek?.join(', ') || '-'}</TableCell>
                        <TableCell>{product.startTime || '-'}</TableCell>
                        <TableCell>
                          {meetingInfo.current}/{meetingInfo.total}
                        </TableCell>
                        <TableCell>
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
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4 ml-1" />
                              ערוך
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p>אין מוצרים בעונה זו</p>
          )}
        </div>
      )}

      <AddSeasonDialog 
        isOpen={isAddSeasonOpen}
        onOpenChange={setIsAddSeasonOpen}
      />

      <EditProductDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={editingProduct}
        onSubmit={handleUpdateProduct}
      />
    </div>
  );
}
