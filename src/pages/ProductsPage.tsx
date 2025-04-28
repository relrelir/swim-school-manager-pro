
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  });

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

      {seasonProducts.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">אין מוצרים בעונה זו. הוסף מוצר חדש כדי להתחיל.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seasonProducts.map((product) => (
            <Card 
              key={product.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => goToParticipants(product.id)}
            >
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <div className="text-sm text-gray-500">
                  סוג: {product.type}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <span className="font-semibold">תאריכים:</span> {`${formatDate(product.startDate)} - ${formatDate(product.endDate)}`}
                </p>
                <p>
                  <span className="font-semibold">מחיר:</span> {formatPrice(product.price)}
                </p>
                <p>
                  <span className="font-semibold">משתתפים מקס:</span> {product.maxParticipants}
                </p>
                {product.notes && (
                  <p>
                    <span className="font-semibold">הערות:</span> {product.notes}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={(e) => {
                  e.stopPropagation();
                  goToParticipants(product.id);
                }}>
                  צפה במשתתפים
                </Button>
              </CardFooter>
            </Card>
          ))}
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
