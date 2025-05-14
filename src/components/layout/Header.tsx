
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Key } from 'lucide-react';

const Header = () => {
  const { logout, changePassword, user, isAdmin } = useAuth();
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
    <header className="bg-primary text-white py-3 px-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-reverse space-x-3">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            <img 
              src="/images/inbar-logo.png" 
              alt="ענבר במדבר" 
              className="h-6 w-6 object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-alef font-bold">בית ספר לשחייה - ניהול</h1>
            {user && <p className="text-xs text-white/80">שלום, {user.displayName}</p>}
          </div>
        </div>
        
        <div className="flex gap-2">
          {isAdmin() && (
            <Button variant="outline" size="sm" onClick={() => setIsPasswordDialogOpen(true)} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">החלפת סיסמה</span>
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={logout} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">התנתקות</span>
          </Button>
        </div>
      </div>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md animate-enter">
          <DialogHeader>
            <DialogTitle className="font-alef">שינוי סיסמה</DialogTitle>
            <DialogDescription>
              אנא הזן את הסיסמה החדשה (לפחות 4 תווים)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4 py-4">
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
                <Key className="h-4 w-4 ml-2" />
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
