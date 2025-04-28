
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/context/DataContext';
import { Season } from '@/types';
import { format } from 'date-fns';

const SeasonPage: React.FC = () => {
  const { seasons, addSeason } = useData();
  const navigate = useNavigate();
  
  const [isAddSeasonOpen, setIsAddSeasonOpen] = useState(false);
  const [newSeason, setNewSeason] = useState<Omit<Season, 'id'>>({
    name: '',
    startDate: '',
    endDate: '',
  });

  const handleCreateSeason = (e: React.FormEvent) => {
    e.preventDefault();
    addSeason(newSeason);
    setIsAddSeasonOpen(false);
    setNewSeason({ name: '', startDate: '', endDate: '' });
  };

  const goToProducts = (seasonId: string) => {
    navigate(`/season/${seasonId}/products`);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">עונות</h1>
        <Button onClick={() => setIsAddSeasonOpen(true)}>
          הוסף עונה חדשה
        </Button>
      </div>

      {seasons.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">אין עונות להצגה. הוסף עונה חדשה כדי להתחיל.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seasons.map((season) => (
            <Card 
              key={season.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => goToProducts(season.id)}
            >
              <CardHeader>
                <CardTitle>{season.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <span className="font-semibold">תאריך התחלה:</span> {formatDate(season.startDate)}
                </p>
                <p>
                  <span className="font-semibold">תאריך סיום:</span> {formatDate(season.endDate)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddSeasonOpen} onOpenChange={setIsAddSeasonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוסף עונה חדשה</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSeason}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="season-name">שם העונה</Label>
                <Input
                  id="season-name"
                  value={newSeason.name}
                  onChange={(e) => setNewSeason({ ...newSeason, name: e.target.value })}
                  placeholder="לדוגמה: קיץ 2025"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date">תאריך התחלה</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newSeason.startDate}
                  onChange={(e) => setNewSeason({ ...newSeason, startDate: e.target.value })}
                  required
                  className="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">תאריך סיום</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newSeason.endDate}
                  onChange={(e) => setNewSeason({ ...newSeason, endDate: e.target.value })}
                  required
                  className="ltr"
                  min={newSeason.startDate} // Ensure end date is after start date
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">צור עונה</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeasonPage;
