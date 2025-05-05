
import React, { Suspense, lazy, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorState, LoadingState } from '@/components/health-form/HealthFormStates';
import { useHealthForm } from '@/hooks/useHealthForm';
import SignaturePadComponent from '@/components/health-form/SignaturePad';

// אופטימיזציה: שימוש ב-lazy loading לטעינת תוכן הטופס רק כשנדרש
const HealthDeclarationContent = lazy(() => import('@/components/health-form/HealthDeclarationContent'));

const HealthFormPage: React.FC = () => {
  const {
    isLoading,
    isLoadingData,
    participantName,
    participantId,
    participantPhone,
    error,
    formState,
    handleAgreementChange,
    handleNotesChange,
    handleParentNameChange,
    handleParentIdChange,
    handleSignatureChange,
    handleSubmit
  } = useHealthForm();

  const [showSignaturePad, setShowSignaturePad] = useState(false);

  // Show error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // Loading state
  if (isLoadingData) {
    return <LoadingState />;
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before showing signature pad
    if (!formState.agreement) {
      alert("יש לאשר את הצהרת הבריאות כדי להמשיך");
      return;
    }
    
    if (!formState.parentName || !formState.parentId) {
      alert("יש למלא את פרטי ההורה/אפוטרופוס");
      return;
    }
    
    // Show signature pad
    setShowSignaturePad(true);
  };

  const handleSignatureConfirm = (signatureData: string) => {
    // Update form state with signature
    handleSignatureChange(signatureData);
    
    // Submit the form
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleCancelSignature = () => {
    setShowSignaturePad(false);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>הצהרת בריאות</CardTitle>
          <CardDescription>
            {participantName ? `עבור ${participantName}` : 'אנא מלא את הפרטים הבאים והצהר על בריאות המשתתף'}
          </CardDescription>
        </CardHeader>
        
        {showSignaturePad ? (
          <CardContent>
            <SignaturePadComponent 
              onSignatureConfirm={handleSignatureConfirm}
              onCancel={handleCancelSignature}
            />
          </CardContent>
        ) : (
          <form onSubmit={handleFormSubmit}>
            <CardContent>
              <Suspense fallback={<div className="p-4 text-center">טוען תוכן טופס...</div>}>
                <HealthDeclarationContent 
                  participantName={participantName}
                  participantId={participantId}
                  participantPhone={participantPhone}
                  formState={formState}
                  handleAgreementChange={handleAgreementChange}
                  handleNotesChange={handleNotesChange}
                  handleParentNameChange={handleParentNameChange}
                  handleParentIdChange={handleParentIdChange}
                />
              </Suspense>
            </CardContent>
            
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'שולח...' : 'אישור הצהרה'}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

export default HealthFormPage;
