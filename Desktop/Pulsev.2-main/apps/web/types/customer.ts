export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: Date;
  socialSecurityNumber?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  alternatePhone?: string;
  address: Address;
  preferredContact: 'email' | 'phone' | 'text';
  timezone?: string;
}

export interface ProjectInfo {
  systemSize: number; // in kW
  estimatedCost: number;
  installationAddress: Address;
  roofType: 'asphalt_shingle' | 'tile' | 'metal' | 'flat' | 'other';
  roofCondition: 'excellent' | 'good' | 'fair' | 'poor';
  panelType: 'monocrystalline' | 'polycrystalline' | 'thin_film';
  inverterType: 'string' | 'power_optimizer' | 'microinverter';
  expectedCompletionDate?: Date;
  utilityCompany: string;
  currentElectricBill: number;
  annualElectricUsage: number; // in kWh
  shading: 'none' | 'minimal' | 'moderate' | 'significant';
  permits: {
    building: boolean;
    electrical: boolean;
    utility: boolean;
  };
}

export type CustomerStatus = 
  | 'lead' 
  | 'qualified' 
  | 'proposal_sent' 
  | 'contract_signed' 
  | 'installation_scheduled' 
  | 'installation_complete' 
  | 'warranty_active' 
  | 'closed';

export interface Customer {
  id: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  projectInfo?: ProjectInfo;
  status: CustomerStatus;
  leadSource: string;
  assignedSalesperson?: string;
  assignedContractor?: string;
  tags: string[];
  notes: string;
  documents: string[]; // Document IDs
  contracts: string[]; // Contract IDs
  communicationHistory: string[]; // Communication IDs
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

export interface CustomerFilters {
  status?: CustomerStatus[];
  leadSource?: string[];
  assignedSalesperson?: string[];
  assignedContractor?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  systemSizeRange?: {
    min: number;
    max: number;
  };
  estimatedCostRange?: {
    min: number;
    max: number;
  };
}

export interface CreateCustomerData {
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  projectInfo?: Partial<ProjectInfo>;
  leadSource: string;
  assignedSalesperson?: string;
  tags?: string[];
  notes?: string;
}