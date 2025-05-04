
import { useState } from 'react';
import { HealthDeclaration } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { findHealthDeclarationByRegistrationId } from '@/context/data/healthDeclarations/utils/healthDeclarationLookup';

/**
 * Custom hook for looking up health declarations by different ID types
 */
export const useHealthDeclarationLookup = (healthDeclarations: HealthDeclaration[]) => {
  const [lookupLoading, setLookupLoading] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  /**
   * Find a health declaration by registration ID with improved error handling
   */
  const findDeclarationByRegistrationId = async (registrationId: string): Promise<HealthDeclaration | undefined> => {
    if (!registrationId) {
      setLookupError("Registration ID is required");
      return undefined;
    }
    
    setLookupLoading(true);
    setLookupError(null);
    
    try {
      console.log("Looking up health declaration for registration:", registrationId);
      const declaration = await findHealthDeclarationByRegistrationId(registrationId, healthDeclarations);
      
      if (declaration) {
        console.log("Found health declaration by registration ID:", declaration.id);
      } else {
        console.log("No health declaration found for registration ID:", registrationId);
      }
      
      return declaration;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error looking up health declaration";
      console.error(errorMessage, error);
      setLookupError(errorMessage);
      return undefined;
    } finally {
      setLookupLoading(false);
    }
  };

  /**
   * Find health declaration by participant ID directly
   */
  const findDeclarationByParticipantId = async (participantId: string): Promise<HealthDeclaration | undefined> => {
    if (!participantId) {
      setLookupError("Participant ID is required");
      return undefined;
    }
    
    setLookupLoading(true);
    setLookupError(null);
    
    try {
      console.log("Looking up health declaration for participant:", participantId);
      
      // First try direct match with participant_id
      const directMatch = healthDeclarations.find(
        declaration => declaration.participant_id === participantId
      );
      
      if (directMatch) {
        console.log("Found health declaration by direct participant ID match:", directMatch.id);
        return directMatch;
      }
      
      // If no direct match, try to get registration and then find declaration
      const { data: registration, error: registrationError } = await supabase
        .from('registrations')
        .select('id')
        .eq('participantid', participantId)
        .maybeSingle();
      
      if (registrationError) {
        console.error("Error fetching registration:", registrationError);
        throw new Error("Error fetching registration details");
      }
      
      if (registration) {
        console.log("Found registration:", registration.id, "for participant:", participantId);
        return await findDeclarationByRegistrationId(registration.id);
      }
      
      console.log("No registration or health declaration found for participant ID:", participantId);
      return undefined;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error looking up health declaration";
      console.error(errorMessage, error);
      setLookupError(errorMessage);
      return undefined;
    } finally {
      setLookupLoading(false);
    }
  };

  return {
    findDeclarationByRegistrationId,
    findDeclarationByParticipantId,
    lookupLoading,
    lookupError
  };
};
