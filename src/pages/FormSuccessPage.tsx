
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from 'lucide-react';

const FormSuccessPage: React.FC = () => {
  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto my-4 bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>ההצהרה התקבלה בהצלחה</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>תודה על מילוי הצהרת הבריאות.</p>
          <p className="mt-2">ניתן לסגור חלון זה.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormSuccessPage;
