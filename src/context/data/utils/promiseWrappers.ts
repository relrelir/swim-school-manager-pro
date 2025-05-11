
import { Season, Product, Participant, Registration, Payment, HealthDeclaration } from '@/types';

export const promisifyAddProduct = (
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | undefined> | undefined
): (product: Omit<Product, 'id'>) => Promise<Product | undefined> => {
  return async (product: Omit<Product, 'id'>): Promise<Product | undefined> => {
    return await addProduct(product);
  };
};

export const promisifyUpdateSeason = (
  updateSeason: (season: Season) => void
): (season: Season) => Promise<void> => {
  return async (season: Season): Promise<void> => {
    await updateSeason(season);
  };
};

export const promisifyDeleteSeason = (
  deleteSeason: (id: string) => void
): (id: string) => Promise<void> => {
  return async (id: string): Promise<void> => {
    await deleteSeason(id);
  };
};

export const promisifyAddParticipant = (
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined> | undefined
): (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined> => {
  return async (participant: Omit<Participant, 'id'>): Promise<Participant | undefined> => {
    return await addParticipant(participant);
  };
};

export const promisifyUpdateParticipant = (
  updateParticipant: (participant: Participant) => void
): (participant: Participant) => Promise<void> => {
  return async (participant: Participant): Promise<void> => {
    await updateParticipant(participant);
  };
};

export const promisifyDeleteParticipant = (
  deleteParticipant: (id: string) => void
): (id: string) => Promise<void> => {
  return async (id: string): Promise<void> => {
    await deleteParticipant(id);
  };
};

export const promisifyUpdateRegistration = (
  updateRegistration: (registration: Registration) => void
): (registration: Registration) => Promise<void> => {
  return async (registration: Registration): Promise<void> => {
    await updateRegistration(registration);
  };
};

export const promisifyDeleteRegistration = (
  deleteRegistration: (id: string) => void
): (id: string) => Promise<void> => {
  return async (id: string): Promise<void> => {
    await deleteRegistration(id);
  };
};

export const promisifyUpdatePayment = (
  updatePayment: (payment: Payment) => void
): (payment: Payment) => Promise<void> => {
  return async (payment: Payment): Promise<void> => {
    await updatePayment(payment);
  };
};

export const promisifyDeletePayment = (
  deletePayment: (id: string) => void
): (id: string) => Promise<void> => {
  return async (id: string): Promise<void> => {
    await deletePayment(id);
  };
};

export const promisifyUpdateHealthDeclaration = (
  updateHealthDeclaration: (id: string, healthDeclaration: HealthDeclaration) => void
): (healthDeclaration: HealthDeclaration) => Promise<void> => {
  return async (healthDeclaration: HealthDeclaration): Promise<void> => {
    // Pass id and healthDeclaration for the update function
    await updateHealthDeclaration(healthDeclaration.id, healthDeclaration);
  };
};
