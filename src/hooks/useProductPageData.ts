
import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { useData } from '@/context/DataContext';

interface ProductPageSummary {
  registrationsCount: number;
  totalExpected: number;
  totalPaid: number;
}

export function useProductPageData(seasonId: string | undefined) {
  const { 
    seasons, 
    products, 
    getProductsBySeason, 
    getRegistrationsByProduct,
    getPaymentsByRegistration 
  } = useData();

  const [currentSeason, setCurrentSeason] = useState(seasons.find(s => s.id === seasonId));
  const [seasonProducts, setSeasonProducts] = useState<Product[]>([]);
  const [summaryData, setSummaryData] = useState<ProductPageSummary>({
    registrationsCount: 0,
    totalExpected: 0,
    totalPaid: 0
  });

  // Load season and products data
  useEffect(() => {
    if (seasonId) {
      const season = seasons.find(s => s.id === seasonId);
      setCurrentSeason(season);
      
      const products = getProductsBySeason(seasonId);
      setSeasonProducts(products);
    }
  }, [seasonId, seasons, getProductsBySeason]);

  // Calculate season summary data
  useEffect(() => {
    if (seasonProducts.length > 0) {
      let registrationsCount = 0;
      let totalExpected = 0;
      let totalPaid = 0;
      
      seasonProducts.forEach(product => {
        const productRegistrations = getRegistrationsByProduct(product.id);
        registrationsCount += productRegistrations.length;
        
        // Calculate total expected (after discounts)
        totalExpected += productRegistrations.reduce((sum, reg) => 
          sum + Math.max(0, reg.requiredAmount - (reg.discountApproved ? (reg.discountAmount || 0) : 0)), 0);
        
        // Calculate total paid from actual payments only (excluding discounts)
        totalPaid += productRegistrations.reduce((sum, reg) => {
          const regPayments = getPaymentsByRegistration(reg.id);
          // Only include real payments, not discounts
          const paymentsTotal = regPayments.length === 0 ? reg.paidAmount : 
            regPayments.reduce((pSum, payment) => pSum + payment.amount, 0);
          
          return sum + paymentsTotal;
        }, 0);
      });
      
      setSummaryData({
        registrationsCount,
        totalExpected,
        totalPaid
      });
    }
  }, [seasonProducts, getRegistrationsByProduct, getPaymentsByRegistration]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return {
    currentSeason,
    seasonProducts,
    summaryData,
    formatDate,
    setSeasonProducts
  };
}
