import { Address, PersonalInfo, ContactInfo } from './customer';

export interface BusinessInfo {
  companyName?: string;
  businessLicense: string;
  insuranceInfo: {
    general: {
      provider: string;
      policyNumber: string;
      expirationDate: Date;
      coverage: number;
    };
    workersComp?: {
      provider: string;
      policyNumber: string;
      expirationDate: Date;
    };
  };
  bondInfo?: {
    provider: string;
    bondNumber: string;
    amount: number;
    expirationDate: Date;
  };
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  certificationNumber: string;
  issueDate: Date;
  expirationDate?: Date;
  verificationUrl?: string;
  verified: boolean;
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience: number;
  certifications: string[]; // Certification IDs
}

export interface AvailabilitySchedule {
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
      available: boolean;
    };
  };
  timeZone: string;
  maxProjectsPerMonth: number;
  travelRadius: number; // in miles
  preferredProjectTypes: ProjectType[];
}

export type ProjectType = 
  | 'residential_rooftop'
  | 'commercial_rooftop' 
  | 'ground_mount'
  | 'carport'
  | 'battery_storage'
  | 'maintenance'
  | 'repair';

export interface PerformanceMetrics {
  completedProjects: number;
  averageRating: number;
  onTimeCompletion: number; // percentage
  customerSatisfaction: number; // percentage
  revenueGenerated: number;
  averageProjectDuration: number; // in days
  safetyScore: number;
  repeatCustomers: number;
  referrals: number;
}

export type ContractorStatus = 
  | 'active' 
  | 'inactive' 
  | 'suspended' 
  | 'pending_verification' 
  | 'blacklisted';

export interface Contractor {
  id: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  businessInfo?: BusinessInfo;
  certifications: Certification[];
  skills: Skill[];
  availability: AvailabilitySchedule;
  performanceMetrics: PerformanceMetrics;
  status: ContractorStatus;
  verificationStatus: {
    identity: boolean;
    background: boolean;
    insurance: boolean;
    licenses: boolean;
    references: boolean;
  };
  assignedProjects: string[]; // Project IDs
  paymentInfo: {
    rate: number;
    rateType: 'hourly' | 'project' | 'commission';
    preferredPaymentMethod: 'direct_deposit' | 'check' | 'paypal';
    taxId?: string;
  };
  emergencyContact: ContactInfo;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

export interface ContractorFilters {
  status?: ContractorStatus[];
  skills?: string[];
  certifications?: string[];
  availability?: boolean;
  ratingRange?: {
    min: number;
    max: number;
  };
  locationRadius?: {
    center: Address;
    radius: number;
  };
  projectTypes?: ProjectType[];
}

export interface CreateContractorData {
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  businessInfo?: Partial<BusinessInfo>;
  certifications?: Omit<Certification, 'id'>[];
  skills?: Skill[];
  availability: AvailabilitySchedule;
  paymentInfo: Contractor['paymentInfo'];
  emergencyContact: ContactInfo;
  notes?: string;
  tags?: string[];
}