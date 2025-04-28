
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import { Product, ProductType } from '@/types';
import { format } from 'date-fns';

const ProductsPage: React.FC = () => {
  const { seasonId } = useParams<{ seasonId: string }>();
  const navigate = useNavigate();
  const { seasons, products, addProduct, getProductsBySeason } = useData();
  
  const [currentSeason, setCurrentSeason] = useState(seasons.find(s => s.id === seasonId));
  const [seasonProducts, setSeasonProducts] = useState<Product[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    type: 'קורס',
    startDate: '',
    endDate: '',
    price: 0,
    maxParticipants: 10,
    notes: '',
    seasonId: seasonId || '',
    meetingsCount: 1,
    daysOfWeek: [],
    startTime: '',
  });
  
  // Sort options
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Filter
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (seasonId) {
      const season = seasons.find(s => s.id === seasonId);
      setCurrentSeason(season);
      
      const products = getProductsBySeason(seasonId);
      setSeasonProducts(products);
      
      // Set default dates from season
      if (season) {
        setNewProduct(prev => ({
          ...prev,
          startDate: season.startDate,
          endDate: season.endDate,
          seasonId,
        }));
      }
    }
  }, [seasonId, seasons, getProductsBySeason]);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct(newProduct);
    setIsAddProductOpen(false);
    setNewProduct({
      name: '',
      type: 'קורס',
      startDate: currentSeason?.startDate || '',
      endDate: currentSeason?.endDate || '',
      price: 0,
      maxParticipants: 10,
      notes: '',
      seasonId: seasonId || '',
      meetingsCount: 1,
      daysOfWeek: [],
      startTime: '',
    });
    // Refresh products list
    setSeasonProducts(getProductsBySeason(seasonId || ''));
  };

  const goToParticipants = (productId: string) => {
    navigate(`/product/${productId}/participants`);
  };

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
  
  // Day of week options
  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="outline" onClick={() => navigate('/')}>חזרה לעונות</Button>
          <h1 className="text-2xl font-bold mt-2">
            {currentSeason ? `מוצרים בעונת ${currentSeason.name}` : 'מוצרים'}
          </h1>
          {currentSeason && (
            <p className="text-gray-600">
              {`${formatDate(currentSeason.startDate)} - ${formatDate(currentSeason.endDate)}`}
            </p>
          )}
        </div>
        <Button onClick={() => setIsAddProductOpen(true)}>
          הוסף מוצר חדש
        </Button>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-4">
        <Input
          placeholder="חיפוש לפי שם או סוג..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">אין מוצרים בעונה זו. הוסף מוצר חדש כדי להתחיל.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  שם {sortField === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                  סוג {sortField === 'type' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('startDate')}>
                  תאריך התחלה {sortField === 'startDate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('endDate')}>
                  תאריך סיום {sortField === 'endDate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('price')}>
                  מחיר {sortField === 'price' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('maxParticipants')}>
                  מקסימום משתתפים {sortField === 'maxParticipants' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead>ימים</TableHead>
                <TableHead>שעת התחלה</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.type}</TableCell>
                  <TableCell>{formatDate(product.startDate)}</TableCell>
                  <TableCell>{formatDate(product.endDate)}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.maxParticipants}</TableCell>
                  <TableCell>{product.daysOfWeek?.join(', ') || '-'}</TableCell>
                  <TableCell>{product.startTime || '-'}</TableCell>
                  <TableCell>
                    <Button variant="outline" onClick={() => goToParticipants(product.id)}>
                      צפה במשתתפים
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>הוסף מוצר חדש</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProduct}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="product-name">שם המוצר</Label>
                <Input
                  id="product-name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="לדוגמה: קורס שחייה למתחילים"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-type">סוג מוצר</Label>
                <Select 
                  value={newProduct.type} 
                  onValueChange={(value) => setNewProduct({ ...newProduct, type: value as ProductType })}
                >
                  <SelectTrigger id="product-type">
                    <SelectValue placeholder="בחר סוג מוצר" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="קייטנה">קייטנה</SelectItem>
                    <SelectItem value="חוג">חוג</SelectItem>
                    <SelectItem value="קורס">קורס</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">תאריך התחלה</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newProduct.startDate}
                    onChange={(e) => setNewProduct({ ...newProduct, startDate: e.target.value })}
                    required
                    className="ltr"
                    min={currentSeason?.startDate}
                    max={currentSeason?.endDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">תאריך סיום</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newProduct.endDate}
                    onChange={(e) => setNewProduct({ ...newProduct, endDate: e.target.value })}
                    required
                    className="ltr"
                    min={newProduct.startDate}
                    max={currentSeason?.endDate}
                  />
                </div>
              </div>
              
              {/* New fields for meetings count, days of week, and start time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meetings-count">מספר מפגשים</Label>
                  <Input
                    id="meetings-count"
                    type="number"
                    value={newProduct.meetingsCount}
                    onChange={(e) => setNewProduct({ 
                      ...newProduct, 
                      meetingsCount: parseInt(e.target.value) 
                    })}
                    required
                    min={1}
                    className="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-time">שעת התחלה</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={newProduct.startTime}
                    onChange={(e) => setNewProduct({ ...newProduct, startTime: e.target.value })}
                    className="ltr"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>ימי פעילות</Label>
                <div className="grid grid-cols-4 gap-2">
                  {daysOfWeek.map(day => (
                    <div key={day} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id={`day-${day}`}
                        checked={newProduct.daysOfWeek?.includes(day)}
                        onCheckedChange={(checked) => {
                          let updatedDays = [...(newProduct.daysOfWeek || [])];
                          if (checked) {
                            updatedDays.push(day);
                          } else {
                            updatedDays = updatedDays.filter(d => d !== day);
                          }
                          setNewProduct({ ...newProduct, daysOfWeek: updatedDays });
                        }}
                      />
                      <Label htmlFor={`day-${day}`} className="mr-2">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">מחיר</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    required
                    min={0}
                    className="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-participants">מכסת משתתפים מקסימלית</Label>
                  <Input
                    id="max-participants"
                    type="number"
                    value={newProduct.maxParticipants}
                    onChange={(e) => setNewProduct({ ...newProduct, maxParticipants: Number(e.target.value) })}
                    required
                    min={1}
                    className="ltr"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">הערות</Label>
                <Textarea
                  id="notes"
                  value={newProduct.notes}
                  onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                  placeholder="הערות נוספות לגבי המוצר"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">צור מוצר</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
