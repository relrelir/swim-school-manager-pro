import { Product } from "@/types";

export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Error ${operation}:`, error);
};

export const mapProductFromDB = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    price: dbProduct.price,
    imageUrl: dbProduct.imageUrl,
    active: dbProduct.active,
    startDate: dbProduct.startdate,
    endDate: dbProduct.enddate,
    maxParticipants: dbProduct.maxparticipants,
    notes: dbProduct.notes,
    seasonId: dbProduct.seasonid,
    type: dbProduct.type,
    meetingsCount: dbProduct.meetingscount,
    startTime: dbProduct.starttime,
    daysOfWeek: dbProduct.daysofweek,
    discountAmount: dbProduct.discountAmount,
    effectivePrice: dbProduct.effectivePrice,
    poolId: dbProduct.poolid
  };
};

export const mapProductToDB = (product: any) => {
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    seasonid: product.seasonId,
    startdate: product.startDate,
    enddate: product.endDate,
    starttime: product.startTime,
    daysofweek: product.daysOfWeek,
    maxparticipants: product.maxParticipants,
    instructor: product.instructor,
    meetingscount: product.meetingsCount,
    poolid: product.poolId // Add poolId mapping to poolid
  };
};
