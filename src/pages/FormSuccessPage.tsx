
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const FormSuccessPage: React.FC = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center">הצהרת הבריאות התקבלה</CardTitle>
          <CardDescription className="text-center">
            תודה על מילוי הצהרת הבריאות
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            הצהרת הבריאות נקלטה במערכת. אין צורך בפעולות נוספות.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormSuccessPage;
