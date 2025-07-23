export interface PhoneNumber {
  _id: string;
  phoneNumber: string;
  user: {
    _id: string;
    email: string;
  } | null;
  status: 'available' | 'active' | 'reserved';
  reservedUntil: string | null;
  assignedTo?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhoneNumberAvailability {
  number: string;
  isAvailable: boolean;
}

export interface CarouselSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}
