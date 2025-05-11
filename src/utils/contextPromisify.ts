
import { Product, Season, Participant, Registration, Payment, HealthDeclaration } from '@/types';

export const promisifyAddProduct = async (
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | undefined> | undefined
): Promise<(product: Omit<Product, 'id'>) => Promise<Product | undefined>> => {
  return async (product: Omit<Product, 'id'>): Promise<Product | undefined> => {
    return await addProduct(product);
  };
};

export const promisifyUpdateSeason = async (
  updateSeason: (season: Season) => void
): Promise<(season: Season) => Promise<void>> => {
  return async (season: Season): Promise<void> => {
    await updateSeason(season);
  };
};

export const promisifyDeleteSeason = async (
  deleteSeason: (id: string) => void
): Promise<(id: string) => Promise<void>> => {
  return async (id: string): Promise<void> => {
    await deleteSeason(id);
  };
};

export const promisifyAddParticipant = async (
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined> | undefined
): Promise<(participant: Omit<Participant, 'id'>) => Promise<Participant | undefined>> => {
  return async (participant: Omit<Participant, 'id'>): Promise<Participant | undefined> => {
    return await addParticipant(participant);
  };
};

export const promisifyUpdateParticipant = async (
  updateParticipant: (participant: Participant) => void
): Promise<(participant: Participant) => Promise<void>> => {
  return async (participant: Participant): Promise<void> => {
    await updateParticipant(participant);
  };
};

export const promisifyDeleteParticipant = async (
  deleteParticipant: (id: string) => void
): Promise<(id: string) => Promise<void>> => {
  return async (id: string): Promise<void> => {
    await deleteParticipant(id);
  };
};

export const promisifyUpdateRegistration = async (
  updateRegistration: (registration: Registration) => void
): Promise<(registration: Registration) => Promise<void>> => {
  return async (registration: Registration): Promise<void> => {
    await updateRegistration(registration);
  };
};

export const promisifyDeleteRegistration = async (
  deleteRegistration: (id: string) => void
): Promise<(id: string) => Promise<void>> => {
  return async (id: string): Promise<void> => {
    await deleteRegistration(id);
  };
};

export const promisifyUpdatePayment = async (
  updatePayment: (payment: Payment) => void
): Promise<(payment: Payment) => Promise<void>> => {
  return async (payment: Payment): Promise<void> => {
    await updatePayment(payment);
  };
};

export const promisifyDeletePayment = async (
  deletePayment: (id: string) => void
): Promise<(id: string) => Promise<void>> => {
  return async (id: string): Promise<void> => {
    await deletePayment(id);
  };
};

export const promisifyUpdateHealthDeclaration = async (
  updateHealthDeclaration: (id: string, healthDeclaration: HealthDeclaration) => void
): Promise<(healthDeclaration: HealthDeclaration) => Promise<void>> => {
  return async (healthDeclaration: HealthDeclaration): Promise<void> => {
    // Pass id and healthDeclaration for the update function - this fixes the argument count error
    await updateHealthDeclaration(healthDeclaration.id, healthDeclaration);
  };
};
