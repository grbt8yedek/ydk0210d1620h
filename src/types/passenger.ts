// Yolcu düzenleme sayfası için tip tanımları

export interface PassengerFormData {
  firstName: string;
  lastName: string;
  identityNumber: string;
  isForeigner: boolean;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  countryCode: string;
  phone: string;
  gender: 'male' | 'female';
  hasMilCard: boolean;
  hasPassport: boolean;
  passportNumber: string;
  passportExpiry: string;
  milCardNumber: string;
}

export interface PassengerFormProps {
  initialData: PassengerFormData;
  onSubmit: (formData: PassengerFormData) => void;
  isLoading: boolean;
}

export interface PersonalInfoSectionProps {
  formData: PassengerFormData;
  onFormDataChange: (data: Partial<PassengerFormData>) => void;
}

export interface ContactInfoSectionProps {
  formData: PassengerFormData;
  onFormDataChange: (data: Partial<PassengerFormData>) => void;
}

export interface DocumentSectionProps {
  formData: PassengerFormData;
  onFormDataChange: (data: Partial<PassengerFormData>) => void;
}

export interface DateSelectorProps {
  value: { day: string; month: string; year: string };
  onChange: (value: { day: string; month: string; year: string }) => void;
  label: string;
} 