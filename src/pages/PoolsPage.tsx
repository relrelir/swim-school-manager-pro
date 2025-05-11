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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';

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

  if (loading) {
    return <div>טוען בריכות...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            בריכות - {currentSeason?.name || ''}
          </h1>
          <p className="text-gray-500">
            ניהול בריכות בעונה {currentSeason?.name || ''}
          </p>
        </div>
        <Button onClick={() => setIsAddPoolDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>הוסף בריכה</span>
        </Button>
      </div>

      {pools.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
            <CardTitle className="text-xl font-medium mb-2">אין בריכות</CardTitle>
            <CardDescription>
              לא נמצאו בריכות בעונה זו. הוסף בריכה חדשה כדי להתחיל.
            </CardDescription>
            <Button variant="outline" className="mt-4" onClick={() => setIsAddPoolDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              הוסף בריכה
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pools.map(pool => (
                <TableRow key={pool.id}>
                  <TableCell className="font-medium">{pool.name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleNavigateToProducts(pool.id)}>
                        מוצרים
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(pool)}>
                        <Edit className="h-4 w-4 ml-1" />
                        ערוך
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeletePool(pool.id)}>
                        <Trash2 className="h-4 w-4 ml-1" />
                        מחק
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
