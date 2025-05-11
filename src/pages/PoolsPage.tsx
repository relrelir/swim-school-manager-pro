
import React, { useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { usePools } from '@/hooks/usePools';
import { Pool } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Plus, Edit, Trash2, ChevronLeft, Loader2 } from 'lucide-react';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

const PoolsPage: React.FC = () => {
  const { seasonId } = useParams<{ seasonId: string }>();
  const navigate = useNavigate();
  const { seasons } = useData();

  const {
    pools,
    loading,
    isAddPoolDialogOpen,
    setIsAddPoolDialogOpen,
    editingPool,
    setEditingPool,
    handleAddPool,
    handleUpdatePool,
    handleDeletePool
  } = usePools(seasonId);

  const [newPoolName, setNewPoolName] = useState('');
  const [editPoolName, setEditPoolName] = useState('');
  const [isEditPoolDialogOpen, setIsEditPoolDialogOpen] = useState(false);
  const [deletingPoolId, setDeletingPoolId] = useState<string | null>(null);

  const currentSeason = seasons.find(s => s.id === seasonId);

  const openEditDialog = (pool: Pool) => {
    setEditingPool(pool);
    setEditPoolName(pool.name);
    setIsEditPoolDialogOpen(true);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingPool) {
      handleUpdatePool({
        ...editingPool,
        name: editPoolName
      });
      setIsEditPoolDialogOpen(false);
    }
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleAddPool(newPoolName);
    setNewPoolName('');
  };

  const handleNavigateToProducts = (poolId: string) => {
    navigate(`/season/${seasonId}/pool/${poolId}/products`);
  };
  
  const handleBackToSeasons = () => {
    navigate('/');
  };

  const handlePoolDelete = async (poolId: string) => {
    setDeletingPoolId(poolId);
    await handleDeletePool(poolId);
    setDeletingPoolId(null);
  };

  if (loading && pools.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">טוען בריכות...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">עונות</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="font-bold">בריכות - {currentSeason?.name || ''}</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold mt-2">
            בריכות - {currentSeason?.name || ''}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackToSeasons} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            <span>חזרה לעונות</span>
          </Button>
          <Button onClick={() => setIsAddPoolDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>הוסף בריכה</span>
          </Button>
        </div>
      </div>

      {pools.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
            <h3 className="text-xl font-medium mb-2">אין בריכות</h3>
            <p className="text-gray-500 mb-4">
              לא נמצאו בריכות בעונה זו. הוסף בריכה חדשה כדי להתחיל.
            </p>
            <Button variant="outline" onClick={() => setIsAddPoolDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              הוסף בריכה
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map(pool => (
            <Card key={pool.id} className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold">{pool.name}</h2>
              </CardContent>
              <CardFooter className="bg-gray-50 flex flex-wrap gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => handleNavigateToProducts(pool.id)}>
                  מוצרים
                </Button>
                <Button variant="outline" size="sm" onClick={() => openEditDialog(pool)}>
                  <Edit className="h-4 w-4 ml-1" />
                  ערוך
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePoolDelete(pool.id)}
                  disabled={loading || deletingPoolId === pool.id}
                >
                  {deletingPoolId === pool.id ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                      מוחק...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 ml-1" />
                      מחק
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Pool Dialog */}
      <Dialog open={isAddPoolDialogOpen} onOpenChange={setIsAddPoolDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוסף בריכה חדשה</DialogTitle>
            <DialogDescription>
              הוסף בריכה חדשה לעונה {currentSeason?.name || ''}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="pool-name">שם הבריכה</Label>
                <Input
                  id="pool-name"
                  value={newPoolName}
                  onChange={e => setNewPoolName(e.target.value)}
                  placeholder="לדוגמה: בריכה ראשית"
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">הוסף בריכה</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Pool Dialog */}
      <Dialog open={isEditPoolDialogOpen} onOpenChange={setIsEditPoolDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ערוך בריכה</DialogTitle>
            <DialogDescription>שינוי פרטי הבריכה</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-pool-name">שם הבריכה</Label>
                <Input
                  id="edit-pool-name"
                  value={editPoolName}
                  onChange={e => setEditPoolName(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">שמור שינויים</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PoolsPage;
