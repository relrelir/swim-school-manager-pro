
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ErrorStateProps {
  error: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>שגיאה</CardTitle>
        <CardDescription>{error}</CardDescription>
      </CardHeader>
    </Card>
  );
};

export const LoadingState: React.FC = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-32 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    </div>
  );
};

// Import this to use the CardContent component in the LoadingState
import { CardContent, CardFooter } from '@/components/ui/card';
