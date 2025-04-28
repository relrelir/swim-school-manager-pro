export interface ReportFilters {
  search: string;
  receiptNumber: string;
  seasonId: string;
  productId: string;
  paymentStatus: string;
}

export const filterRegistrations = (registrations: any[], filters: ReportFilters) => {
  return registrations.filter(registration => {
    const { search, receiptNumber, seasonId, productId, paymentStatus } = filters;
    
    // Search filter (name or ID)
    const nameMatch = 
      `${registration.participant.firstName} ${registration.participant.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase());
    
    const idMatch = registration.participant.idNumber.toLowerCase().includes(search.toLowerCase());
    
    // Receipt number filter
    const receiptNumberMatch = receiptNumber 
      ? (registration.receiptNumber?.toLowerCase().includes(receiptNumber.toLowerCase()) || 
         registration.payments?.some(p => p.receiptNumber?.toLowerCase().includes(receiptNumber.toLowerCase())))
      : true;
    
    // Season filter
    const seasonMatch = seasonId === 'all' ? true : registration.season.id === seasonId;
    
    // Product filter
    const productMatch = productId === 'all' ? true : registration.product.id === productId;
    
    // Payment status filter
    let paymentStatusMatch = true;
    if (paymentStatus !== 'all') {
      if (paymentStatus === 'הנחה') {
        paymentStatusMatch = registration.discountApproved === true;
      } else {
        paymentStatusMatch = registration.paymentStatus === paymentStatus;
      }
    }
    
    return (nameMatch || idMatch) && 
           receiptNumberMatch && 
           seasonMatch && 
           productMatch && 
           paymentStatusMatch;
  });
};
