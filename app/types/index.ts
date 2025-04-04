export interface Patient {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  nextAppointment?: string;
  photoUrl?: string;
  notes?: string;
  treatmentPlan?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  photoUrl?: string;
  patientsCount: number;
  yearsOfExperience: number;
}