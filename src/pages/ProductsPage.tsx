
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
import { useProductsTable } from '@/hooks/useProductsTable';
import { Edit } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const { seasonId } = useParams<{ seasonId: string }>();
  const navigate = useNavigate();
  const { seasons, products, addProduct, getProductsBySeason, updateProduct } = useData();
  
  const [currentSeason, setCurrentSeason] = useState(seasons.find(s => s.id === seasonId));
  const [seasonProducts, setSeasonProducts] = useState<Product[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  // Use our custom hook for filtering and sorting
  const { 
    filter, 
    setFilter, 
    sortField, 
    sortDirection, 
    handleSort, 
    filteredAndSortedProducts 
  } = useProductsTable({ products: seasonProducts });
  
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

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditProductOpen(true);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct);
      setIsEditProductOpen(false);
      setEditingProduct(null);
      // Refresh products list
      setSeasonProducts(getProductsBySeason(seasonId || ''));
    }
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
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => goToParticipants(product.id)}>
                        צפה במשתתפים
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                        <Edit className="h-4 w-4 ml-1" />
                        ערוך
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Product Dialog */}
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

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>עריכת מוצר</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleUpdateProduct}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-product-name">שם המוצר</Label>
                  <Input
                    id="edit-product-name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-product-type">סוג מוצר</Label>
                  <Select 
                    value={editingProduct.type} 
                    onValueChange={(value) => setEditingProduct({ ...editingProduct, type: value as ProductType })}
                  >
                    <SelectTrigger id="edit-product-type">
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
                    <Label htmlFor="edit-start-date">תאריך התחלה</Label>
                    <Input
                      id="edit-start-date"
                      type="date"
                      value={editingProduct.startDate}
                      onChange={(e) => setEditingProduct({ ...editingProduct, startDate: e.target.value })}
                      required
                      className="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-end-date">תאריך סיום</Label>
                    <Input
                      id="edit-end-date"
                      type="date"
                      value={editingProduct.endDate}
                      onChange={(e) => setEditingProduct({ ...editingProduct, endDate: e.target.value })}
                      required
                      className="ltr"
                    />
                  </div>
                </div>
                
                {/* Edit fields for meetings count, days of week, and start time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-meetings-count">מספר מפגשים</Label>
                    <Input
                      id="edit-meetings-count"
                      type="number"
                      value={editingProduct.meetingsCount || 1}
                      onChange={(e) => setEditingProduct({ 
                        ...editingProduct, 
                        meetingsCount: parseInt(e.target.value) 
                      })}
                      required
                      min={1}
                      className="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-start-time">שעת התחלה</Label>
                    <Input
                      id="edit-start-time"
                      type="time"
                      value={editingProduct.startTime || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, startTime: e.target.value })}
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
                          id={`edit-day-${day}`}
                          checked={editingProduct.daysOfWeek?.includes(day)}
                          onCheckedChange={(checked) => {
                            let updatedDays = [...(editingProduct.daysOfWeek || [])];
                            if (checked) {
                              updatedDays.push(day);
                            } else {
                              updatedDays = updatedDays.filter(d => d !== day);
                            }
                            setEditingProduct({ ...editingProduct, daysOfWeek: updatedDays });
                          }}
                        />
                        <Label htmlFor={`edit-day-${day}`} className="mr-2">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">מחיר</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      required
                      min={0}
                      className="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-max-participants">מכסת משתתפים מקסימלית</Label>
                    <Input
                      id="edit-max-participants"
                      type="number"
                      value={editingProduct.maxParticipants}
                      onChange={(e) => setEditingProduct({ ...editingProduct, maxParticipants: Number(e.target.value) })}
                      required
                      min={1}
                      className="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">הערות</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingProduct.notes}
                    onChange={(e) => setEditingProduct({ ...editingProduct, notes: e.target.value })}
                    placeholder="הערות נוספות לגבי המוצר"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit">שמור שינויים</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
