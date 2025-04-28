import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useData } from "@/context/DataContext";
import { useSeasonProducts } from '@/hooks/useSeasonProducts';
import EditProductDialog from '@/components/products/EditProductDialog';

export default function SeasonPage() {
  const navigate = useNavigate();
  const { seasons, addSeason } = useData();
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
  const [newSeason, setNewSeason] = useState({
    name: "",
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().substring(0, 10)
  });

  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSeason.name || !newSeason.startDate || !newSeason.endDate) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addSeason(newSeason);
      setIsAddSeasonOpen(false);
      toast({
        title: "עונה נוספה בהצלחה",
        description: `העונה "${newSeason.name}" נוספה בהצלחה`
      });
      
      // Reset form
      setNewSeason({
        name: "",
        startDate: new Date().toISOString().substring(0, 10),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().substring(0, 10)
      });
      
    } catch (error) {
      console.error('Failed to add season:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את העונה",
        variant: "destructive"
      });
    }
  };

  const handleViewProducts = (seasonId: string) => {
    navigate(`/season/${seasonId}/products`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">עונות שחייה</h1>
        <Dialog open={isAddSeasonOpen} onOpenChange={setIsAddSeasonOpen}>
          <DialogTrigger asChild>
            <Button>הוסף עונה</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוסף עונה חדשה</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSeason}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="season-name">שם העונה</Label>
                  <Input
                    id="season-name"
                    value={newSeason.name}
                    onChange={(e) => setNewSeason({ ...newSeason, name: e.target.value })}
                    placeholder="קיץ 2025"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="start-date">תאריך התחלה</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newSeason.startDate}
                    onChange={(e) => setNewSeason({ ...newSeason, startDate: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-date">תאריך סיום</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newSeason.endDate}
                    onChange={(e) => setNewSeason({ ...newSeason, endDate: e.target.value })}
                  />
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="submit">הוסף עונה</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {seasons.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">לא קיימות עונות</p>
          <p className="text-gray-400 text-sm">הוסיפו עונה חדשה כדי להתחיל</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seasons.map((season) => {
            const productCount = seasonProducts.filter(p => p.seasonId === season.id).length;
            
            return (
              <Card key={season.id} className="bg-white shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold">{season.name}</h2>
                  <div className="mt-4 space-y-2 text-gray-600">
                    <p className="flex justify-between">
                      <span className="text-gray-500">מתאריך:</span>
                      <span>{new Date(season.startDate).toLocaleDateString('he-IL')}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">עד תאריך:</span>
                      <span>{new Date(season.endDate).toLocaleDateString('he-IL')}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">מוצרים:</span>
                      <span>{productCount}</span>
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-end p-4">
                  <Button variant="secondary" onClick={() => handleViewProducts(season.id)}>
                    צפה במוצרים
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {season && season.id && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">מוצרים בעונה: {season.name}</h2>
          
          {seasonProducts.length > 0 ? (
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
                  {seasonProducts.map((product) => {
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
                              onClick={() => handleEditProduct(product)}
                            >
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
      )}

      <EditProductDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={editingProduct}
        onSubmit={handleUpdateProduct}
      />
    </div>
  );
}
