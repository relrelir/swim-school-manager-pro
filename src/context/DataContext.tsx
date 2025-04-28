
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Season, Product, Participant, Registration, RegistrationWithDetails, PaymentStatus } from '@/types';

interface DataContextType {
  // Seasons
  seasons: Season[];
  addSeason: (season: Omit<Season, 'id'>) => void;
  updateSeason: (season: Season) => void;
  deleteSeason: (id: string) => void;
  
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  getProductsBySeason: (seasonId: string) => Product[];
  
  // Participants
  participants: Participant[];
  addParticipant: (participant: Omit<Participant, 'id'>) => void;
  updateParticipant: (participant: Participant) => void;
  deleteParticipant: (id: string) => void;
  
  // Registrations
  registrations: Registration[];
  addRegistration: (registration: Omit<Registration, 'id'>) => void;
  updateRegistration: (registration: Registration) => void;
  deleteRegistration: (id: string) => void;
  getRegistrationsByProduct: (productId: string) => Registration[];
  
  // Combined data
  getRegistrationDetails: (productId: string) => RegistrationWithDetails[];
  getAllRegistrationsWithDetails: () => RegistrationWithDetails[];
  getParticipantsByProduct: (productId: string) => Participant[];
  calculatePaymentStatus: (registration: Registration) => PaymentStatus;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Helper function to generate unique IDs
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Helper to load data from localStorage
const loadData = <T,>(key: string, defaultValue: T): T => {
  try {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : defaultValue;
  } catch (error) {
    console.error(`Error loading data from localStorage for key ${key}:`, error);
    return defaultValue;
  }
};

// Helper to save data to localStorage
const saveData = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data to localStorage for key ${key}:`, error);
  }
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seasons, setSeasons] = useState<Season[]>(() => loadData('swimSchoolSeasons', []));
  const [products, setProducts] = useState<Product[]>(() => loadData('swimSchoolProducts', []));
  const [participants, setParticipants] = useState<Participant[]>(() => loadData('swimSchoolParticipants', []));
  const [registrations, setRegistrations] = useState<Registration[]>(() => loadData('swimSchoolRegistrations', []));

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveData('swimSchoolSeasons', seasons);
  }, [seasons]);

  useEffect(() => {
    saveData('swimSchoolProducts', products);
  }, [products]);

  useEffect(() => {
    saveData('swimSchoolParticipants', participants);
  }, [participants]);

  useEffect(() => {
    saveData('swimSchoolRegistrations', registrations);
  }, [registrations]);

  // Seasons functions
  const addSeason = (season: Omit<Season, 'id'>) => {
    // Check for date overlaps
    const overlapping = seasons.some(existingSeason => {
      const newStart = new Date(season.startDate);
      const newEnd = new Date(season.endDate);
      const existingStart = new Date(existingSeason.startDate);
      const existingEnd = new Date(existingSeason.endDate);
      
      return (
        (newStart >= existingStart && newStart <= existingEnd) ||
        (newEnd >= existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    if (overlapping) {
      toast({
        title: "שגיאה",
        description: "תאריכי העונה חופפים עם עונה קיימת",
        variant: "destructive",
      });
      return;
    }

    const newSeason = { ...season, id: generateId() };
    setSeasons([...seasons, newSeason]);
  };

  const updateSeason = (season: Season) => {
    setSeasons(seasons.map(s => s.id === season.id ? season : s));
  };

  const deleteSeason = (id: string) => {
    // Check if season has products
    const hasProducts = products.some(product => product.seasonId === id);
    if (hasProducts) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק עונה שיש לה מוצרים",
        variant: "destructive",
      });
      return;
    }
    setSeasons(seasons.filter(s => s.id !== id));
  };

  // Products functions
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: generateId() };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (id: string) => {
    // Check if product has registrations
    const hasRegistrations = registrations.some(registration => registration.productId === id);
    if (hasRegistrations) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק מוצר שיש לו רישומי משתתפים",
        variant: "destructive",
      });
      return;
    }
    setProducts(products.filter(p => p.id !== id));
  };

  const getProductsBySeason = (seasonId: string) => {
    return products.filter(product => product.seasonId === seasonId);
  };

  // Participants functions
  const addParticipant = (participant: Omit<Participant, 'id'>) => {
    const newParticipant = { ...participant, id: generateId() };
    setParticipants([...participants, newParticipant]);
  };

  const updateParticipant = (participant: Participant) => {
    setParticipants(participants.map(p => p.id === participant.id ? participant : p));
  };

  const deleteParticipant = (id: string) => {
    // Check if participant has registrations
    const hasRegistrations = registrations.some(registration => registration.participantId === id);
    if (hasRegistrations) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק משתתף שיש לו רישומים",
        variant: "destructive",
      });
      return;
    }
    setParticipants(participants.filter(p => p.id !== id));
  };

  // Registrations functions
  const addRegistration = (registration: Omit<Registration, 'id'>) => {
    // Check if product has space
    const product = products.find(p => p.id === registration.productId);
    if (product) {
      const currentRegistrations = registrations.filter(r => r.productId === registration.productId);
      if (currentRegistrations.length >= product.maxParticipants) {
        toast({
          title: "שגיאה",
          description: "המוצר מלא - הגיע למכסת המשתתפים המקסימלית",
          variant: "destructive",
        });
        return;
      }
    }

    const newRegistration = { ...registration, id: generateId() };
    setRegistrations([...registrations, newRegistration]);
  };

  const updateRegistration = (registration: Registration) => {
    setRegistrations(registrations.map(r => r.id === registration.id ? registration : r));
  };

  const deleteRegistration = (id: string) => {
    setRegistrations(registrations.filter(r => r.id !== id));
  };

  const getRegistrationsByProduct = (productId: string) => {
    return registrations.filter(registration => registration.productId === productId);
  };

  // Calculate payment status
  const calculatePaymentStatus = (registration: Registration): PaymentStatus => {
    if (registration.discountApproved || registration.paidAmount >= registration.requiredAmount) {
      if (registration.paidAmount > registration.requiredAmount) {
        return 'יתר';
      }
      return 'מלא';
    } else if (registration.paidAmount < registration.requiredAmount) {
      return 'חלקי';
    }
    return 'מלא';
  };

  // Combined data functions
  const getRegistrationDetails = (productId: string): RegistrationWithDetails[] => {
    return getRegistrationsByProduct(productId).map(registration => {
      const participant = participants.find(p => p.id === registration.participantId) as Participant;
      const product = products.find(p => p.id === registration.productId) as Product;
      const season = seasons.find(s => s.id === product.seasonId) as Season;

      return {
        ...registration,
        participant,
        product,
        season,
        paymentStatus: calculatePaymentStatus(registration)
      };
    });
  };

  const getAllRegistrationsWithDetails = (): RegistrationWithDetails[] => {
    return registrations.map(registration => {
      const participant = participants.find(p => p.id === registration.participantId) as Participant;
      const product = products.find(p => p.id === registration.productId) as Product;
      const season = seasons.find(s => s.id === product.seasonId) as Season;

      return {
        ...registration,
        participant,
        product,
        season,
        paymentStatus: calculatePaymentStatus(registration)
      };
    });
  };

  const getParticipantsByProduct = (productId: string): Participant[] => {
    const productRegistrations = getRegistrationsByProduct(productId);
    return productRegistrations.map(registration => {
      return participants.find(p => p.id === registration.participantId) as Participant;
    });
  };

  const contextValue: DataContextType = {
    seasons,
    addSeason,
    updateSeason,
    deleteSeason,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsBySeason,
    participants,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    registrations,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    getRegistrationsByProduct,
    getRegistrationDetails,
    getAllRegistrationsWithDetails,
    getParticipantsByProduct,
    calculatePaymentStatus,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};
