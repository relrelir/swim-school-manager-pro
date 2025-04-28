
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useData } from '@/context/DataContext';
import { Participant, Product, Registration, PaymentStatus } from '@/types';

const ParticipantsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { 
    products, 
    participants, 
    addParticipant, 
    getRegistrationsByProduct, 
    addRegistration, 
    updateRegistration,
    deleteRegistration,
    calculatePaymentStatus
  } = useData();
  
  const [product, setProduct] = useState<Product | undefined>();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isEditRegistrationOpen, setIsEditRegistrationOpen] = useState(false);
  const [newParticipant, setNewParticipant] = useState<Omit<Participant, 'id'>>({
    firstName: '',
    lastName: '',
    idNumber: '',
    phone: '',
    healthApproval: false,
  });
  
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const [registrationData, setRegistrationData] = useState({
    requiredAmount: 0,
    paidAmount: 0,
    receiptNumber: '',
    discountApproved: false,
  });

  // Load product and registrations data
  useEffect(() => {
    if (productId) {
      const currentProduct = products.find(p => p.id === productId);
      setProduct(currentProduct);
      
      if (currentProduct) {
        const productRegistrations = getRegistrationsByProduct(productId);
        setRegistrations(productRegistrations);
        
        // Set default required amount for new registrations
        setRegistrationData(prev => ({
          ...prev,
          requiredAmount: currentProduct.price,
        }));
      }
    }
  }, [productId, products, getRegistrationsByProduct]);

  // Handle adding a new participant and registration
  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we don't have a product, return
    if (!product) return;
    
    if (selectedParticipant) {
      // Using existing participant
      const newRegistration: Omit<Registration, 'id'> = {
        productId: productId || '',
        participantId: selectedParticipant.id,
        requiredAmount: registrationData.requiredAmount,
        paidAmount: registrationData.paidAmount,
        receiptNumber: registrationData.receiptNumber,
        discountApproved: registrationData.discountApproved,
        registrationDate: new Date().toISOString(),
      };
      
      addRegistration(newRegistration);
    } else {
      // Adding new participant
      const participant: Omit<Participant, 'id'> = {
        firstName: newParticipant.firstName,
        lastName: newParticipant.lastName,
        idNumber: newParticipant.idNumber,
        phone: newParticipant.phone,
        healthApproval: newParticipant.healthApproval,
      };
      
      // Add participant first
      addParticipant(participant);
      
      // Find the newly added participant (should be the last one in the array)
      const addedParticipant = participants[participants.length - 1];
      
      if (addedParticipant) {
        // Then add registration
        const newRegistration: Omit<Registration, 'id'> = {
          productId: productId || '',
          participantId: addedParticipant.id,
          requiredAmount: registrationData.requiredAmount,
          paidAmount: registrationData.paidAmount,
          receiptNumber: registrationData.receiptNumber,
          discountApproved: registrationData.discountApproved,
          registrationDate: new Date().toISOString(),
        };
        
        addRegistration(newRegistration);
      }
    }
    
    // Reset form and close dialog
    resetForm();
    setIsAddParticipantOpen(false);
    
    // Refresh registrations list
    setRegistrations(getRegistrationsByProduct(productId || ''));
  };

  // Handle updating an existing registration
  const handleUpdateRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentRegistration) {
      const updatedRegistration: Registration = {
        ...currentRegistration,
        requiredAmount: registrationData.requiredAmount,
        paidAmount: registrationData.paidAmount,
        receiptNumber: registrationData.receiptNumber,
        discountApproved: registrationData.discountApproved,
      };
      
      updateRegistration(updatedRegistration);
      
      // Reset form and close dialog
      setCurrentRegistration(null);
      setIsEditRegistrationOpen(false);
      
      // Refresh registrations list
      setRegistrations(getRegistrationsByProduct(productId || ''));
    }
  };

  // Handle deleting a registration
  const handleDeleteRegistration = (registrationId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק רישום זה?')) {
      deleteRegistration(registrationId);
      
      // Refresh registrations list
      setRegistrations(getRegistrationsByProduct(productId || ''));
    }
  };

  // Reset form data
  const resetForm = () => {
    setNewParticipant({
      firstName: '',
      lastName: '',
      idNumber: '',
      phone: '',
      healthApproval: false,
    });
    
    setSelectedParticipant(null);
    
    setRegistrationData({
      requiredAmount: product?.price || 0,
      paidAmount: 0,
      receiptNumber: '',
      discountApproved: false,
    });
  };

  // Get participant details for a registration
  const getParticipantForRegistration = (registration: Registration): Participant | undefined => {
    return participants.find(p => p.id === registration.participantId);
  };

  // Get class name for payment status
  const getStatusClassName = (status: PaymentStatus): string => {
    switch (status) {
      case 'מלא':
        return 'bg-status-paid bg-opacity-20 text-green-800';
      case 'חלקי':
        return 'bg-status-partial bg-opacity-20 text-yellow-800';
      case 'יתר':
        return 'bg-status-overdue bg-opacity-20 text-red-800';
      default:
        return '';
    }
  };

  // Calculate totals
  const totalParticipants = registrations.length;
  const registrationsFilled = product ? (totalParticipants / product.maxParticipants) * 100 : 0;
  const totalExpected = registrations.reduce((sum, reg) => sum + reg.requiredAmount, 0);
  const totalPaid = registrations.reduce((sum, reg) => sum + reg.paidAmount, 0);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="outline" onClick={() => navigate(-1)}>חזרה למוצרים</Button>
          <h1 className="text-2xl font-bold mt-2">
            {product ? `משתתפים ב${product.name}` : 'משתתפים'}
          </h1>
        </div>
        <Button onClick={() => {
          resetForm();
          setIsAddParticipantOpen(true);
        }}>
          הוסף משתתף
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold">
              {totalParticipants} / {product?.maxParticipants || 0}
            </div>
            <div className="text-sm text-gray-500">מקומות תפוסים</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${Math.min(registrationsFilled, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold">
              {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(totalExpected)}
            </div>
            <div className="text-sm text-gray-500">סכום לתשלום</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold">
              {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(totalPaid)}
            </div>
            <div className="text-sm text-gray-500">סכום ששולם</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold">
              {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(totalPaid - totalExpected)}
            </div>
            <div className="text-sm text-gray-500">הפרש</div>
          </CardContent>
        </Card>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">אין משתתפים רשומים. הוסף משתתף חדש כדי להתחיל.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם מלא</TableHead>
                <TableHead>ת.ז</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>סכום לתשלום</TableHead>
                <TableHead>סכום ששולם</TableHead>
                <TableHead>מספר קבלה</TableHead>
                <TableHead>הנחה</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((registration) => {
                const participant = getParticipantForRegistration(registration);
                const status = calculatePaymentStatus(registration);
                
                if (!participant) return null;
                
                return (
                  <TableRow key={registration.id}>
                    <TableCell>{`${participant.firstName} ${participant.lastName}`}</TableCell>
                    <TableCell>{participant.idNumber}</TableCell>
                    <TableCell>{participant.phone}</TableCell>
                    <TableCell>{Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(registration.requiredAmount)}</TableCell>
                    <TableCell>{Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(registration.paidAmount)}</TableCell>
                    <TableCell>{registration.receiptNumber}</TableCell>
                    <TableCell>{registration.discountApproved ? 'כן' : 'לא'}</TableCell>
                    <TableCell className={`font-semibold ${getStatusClassName(status)}`}>
                      {status}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentRegistration(registration);
                            setRegistrationData({
                              requiredAmount: registration.requiredAmount,
                              paidAmount: registration.paidAmount,
                              receiptNumber: registration.receiptNumber,
                              discountApproved: registration.discountApproved,
                            });
                            setIsEditRegistrationOpen(true);
                          }}
                          className="ml-2"
                        >
                          ערוך
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRegistration(registration.id)}
                        >
                          הסר
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Participant Dialog */}
      <Dialog open={isAddParticipantOpen} onOpenChange={setIsAddParticipantOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>הוסף משתתף חדש</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddParticipant}>
            <div className="space-y-4 py-2">
              {selectedParticipant ? (
                <div className="bg-blue-50 p-4 rounded">
                  <p className="font-semibold">משתתף נבחר:</p>
                  <p>{`${selectedParticipant.firstName} ${selectedParticipant.lastName}, ת.ז: ${selectedParticipant.idNumber}`}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedParticipant(null)}
                    className="mt-2"
                  >
                    בחר משתתף אחר
                  </Button>
                </div>
              ) : (
                <>
                  {participants.length > 0 && (
                    <div className="space-y-2">
                      <Label>בחר משתתף קיים</Label>
                      <div className="max-h-32 overflow-y-auto border rounded p-2">
                        {participants.map(participant => (
                          <div 
                            key={participant.id} 
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => setSelectedParticipant(participant)}
                          >
                            {`${participant.firstName} ${participant.lastName} (${participant.idNumber})`}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">או מלא פרטי משתתף חדש:</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">שם פרטי</Label>
                      <Input
                        id="first-name"
                        value={newParticipant.firstName}
                        onChange={(e) => setNewParticipant({ ...newParticipant, firstName: e.target.value })}
                        required={!selectedParticipant}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">שם משפחה</Label>
                      <Input
                        id="last-name"
                        value={newParticipant.lastName}
                        onChange={(e) => setNewParticipant({ ...newParticipant, lastName: e.target.value })}
                        required={!selectedParticipant}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="id-number">תעודת זהות</Label>
                      <Input
                        id="id-number"
                        value={newParticipant.idNumber}
                        onChange={(e) => setNewParticipant({ ...newParticipant, idNumber: e.target.value })}
                        required={!selectedParticipant}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">טלפון</Label>
                      <Input
                        id="phone"
                        value={newParticipant.phone}
                        onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value })}
                        required={!selectedParticipant}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="health-approval"
                      checked={newParticipant.healthApproval}
                      onCheckedChange={(checked) => 
                        setNewParticipant({ ...newParticipant, healthApproval: checked as boolean })
                      }
                    />
                    <Label htmlFor="health-approval" className="mr-2">אישור בריאות</Label>
                  </div>
                </>
              )}
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">פרטי תשלום</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="required-amount">סכום לתשלום</Label>
                    <Input
                      id="required-amount"
                      type="number"
                      value={registrationData.requiredAmount}
                      onChange={(e) => setRegistrationData({ ...registrationData, requiredAmount: Number(e.target.value) })}
                      required
                      min={0}
                      className="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paid-amount">סכום ששולם</Label>
                    <Input
                      id="paid-amount"
                      type="number"
                      value={registrationData.paidAmount}
                      onChange={(e) => setRegistrationData({ ...registrationData, paidAmount: Number(e.target.value) })}
                      required
                      min={0}
                      className="ltr"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="receipt-number">מספר קבלה</Label>
                  <Input
                    id="receipt-number"
                    value={registrationData.receiptNumber}
                    onChange={(e) => setRegistrationData({ ...registrationData, receiptNumber: e.target.value })}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="discount-approved"
                    checked={registrationData.discountApproved}
                    onCheckedChange={(checked) => 
                      setRegistrationData({ ...registrationData, discountApproved: checked as boolean })
                    }
                  />
                  <Label htmlFor="discount-approved" className="mr-2">אישור הנחה</Label>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">
                {selectedParticipant ? 'רשום משתתף קיים' : 'רשום משתתף חדש'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Registration Dialog */}
      <Dialog open={isEditRegistrationOpen} onOpenChange={setIsEditRegistrationOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>ערוך פרטי רישום</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateRegistration}>
            <div className="space-y-4 py-2">
              {currentRegistration && (
                <>
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="font-semibold">עריכת רישום למשתתף:</p>
                    {participants.find(p => p.id === currentRegistration.participantId) && (
                      <p>
                        {`${participants.find(p => p.id === currentRegistration.participantId)?.firstName} ${participants.find(p => p.id === currentRegistration.participantId)?.lastName}`}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-required-amount">סכום לתשלום</Label>
                      <Input
                        id="edit-required-amount"
                        type="number"
                        value={registrationData.requiredAmount}
                        onChange={(e) => setRegistrationData({ ...registrationData, requiredAmount: Number(e.target.value) })}
                        required
                        min={0}
                        className="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-paid-amount">סכום ששולם</Label>
                      <Input
                        id="edit-paid-amount"
                        type="number"
                        value={registrationData.paidAmount}
                        onChange={(e) => setRegistrationData({ ...registrationData, paidAmount: Number(e.target.value) })}
                        required
                        min={0}
                        className="ltr"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-receipt-number">מספר קבלה</Label>
                    <Input
                      id="edit-receipt-number"
                      value={registrationData.receiptNumber}
                      onChange={(e) => setRegistrationData({ ...registrationData, receiptNumber: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-discount-approved"
                      checked={registrationData.discountApproved}
                      onCheckedChange={(checked) => 
                        setRegistrationData({ ...registrationData, discountApproved: checked as boolean })
                      }
                    />
                    <Label htmlFor="edit-discount-approved" className="mr-2">אישור הנחה</Label>
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">עדכן רישום</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParticipantsPage;
