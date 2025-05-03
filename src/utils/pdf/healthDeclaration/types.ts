
export interface HealthDeclarationType {
  id: string;
  participant_id: string;
  submission_date: string | null;
  notes: string | null;
  form_status: string;
}

export interface ParticipantType {
  firstname: string;
  lastname: string;
  idnumber: string;
  phone: string;
}
