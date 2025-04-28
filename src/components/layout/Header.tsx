
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Header = () => {
  const { logout, changePassword, defaultPasswordChanged } = useAuth();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      return;
    }
    changePassword(newPassword);
    setIsPasswordDialogOpen(false);
    setNewPassword("");
  };

  return (
    <header className="bg-primary text-white p-4">
      <div className="container flex justify-between items-center">
        <h1 className="text-xl font-bold">בית ספר לשחייה - ניהול</h1>
        <div className="flex gap-4">
          {!defaultPasswordChanged && (
            <Button 
              variant="secondary" 
              onClick={() => setIsPasswordDialogOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              שנה סיסמת ברירת מחדל
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
            שנה סיסמה
          </Button>
          <Button variant="destructive" onClick={logout}>
            התנתק
          </Button>
        </div>
      </div>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>שינוי סיסמה</DialogTitle>
            <DialogDescription>
              אנא הזן את הסיסמה החדשה (לפחות 4 תווים)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">סיסמה חדשה</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rtl"
                  placeholder="הזן סיסמה חדשה"
                  minLength={4}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={newPassword.length < 4}>
                שמור סיסמה חדשה
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
