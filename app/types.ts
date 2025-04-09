export interface Patient {
  id: string;
  name: string;
  age: number;
  photoUrl: string;
  lastVisit: string;
  nextAppointment?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
  userId?: string; // To associate with specific user
}

export interface User {
  id: string;
  email: string;
  name?: string;
  profileImageUrl?: string;
}