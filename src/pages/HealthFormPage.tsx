
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorState, LoadingState } from '@/components/health-form/HealthFormStates';
import HealthDeclarationContent from '@/components/health-form/HealthDeclarationContent';
import { useHealthForm } from '@/hooks/useHealthForm';

const HealthFormPage: React.FC = () => {
  const {
    isLoading,
    isLoadingData,
    participantName,
    error,
    formState,
    handleAgreementChange,
    handleNotesChange,
    handleSubmit
  } = useHealthForm();

  // Show error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // Loading state
  if (isLoadingData) {
    return <LoadingState />;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>הצהרת בריאות</CardTitle>
          <CardDescription>
            {participantName ? `עבור ${participantName}` : 'אנא מלא את הפרטים הבאים והצהר על בריאות המשתתף'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <HealthDeclarationContent 
              participantName={participantName}
              formState={formState}
              handleAgreementChange={handleAgreementChange}
              handleNotesChange={handleNotesChange}
            />
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading || !formState.agreement}>
              {isLoading ? 'שולח...' : 'אישור הצהרה'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default HealthFormPage;
