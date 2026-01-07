'use client';

/**
 * Identity Verification Page - AMU Platform
 *
 * Comprehensive multi-step form for Tier 3 identity verification (Section 5.4, 10.3).
 * Collects ALL mandatory SETA fields per Data-Required-By-SETAs.pdf.
 *
 * Steps:
 * 1. Personal Details - Title, name, gender, DOB
 * 2. Identification - ID number, citizenship, visa status
 * 3. Equity & Language - Race, home language, disability
 * 4. Contact & Address - Phone numbers, email, structured address
 * 5. Employment - Employer details, supervisor (if employed)
 * 6. Education - Qualifications, matric status
 * 7. Documents - Upload ID and proof of residence
 * 8. Consent - POPI Act consent
 * 9. Review - Full compliance data summary
 *
 * "Ubuntu - I am because we are"
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  validateSAID,
  uploadIdentityDocument,
} from '@/lib/identity';
import type {
  DocumentType,
  VerificationStatus,
  VerificationStep,
  UploadProgress,
  PersonTitle,
  Gender,
  EquityGroup,
  CitizenStatus,
  AlternativeIdType,
  DisabilityStatus,
  HighestQualification,
  SocioeconomicStatus,
  HomeLanguage,
  SAProvince,
  SetaAddress,
  EmergencyContact,
  EmploymentDetails,
} from '@/lib/identity/types';
import {
  TITLE_OPTIONS,
  GENDER_OPTIONS,
  EQUITY_OPTIONS,
  CITIZEN_STATUS_OPTIONS,
  ALTERNATIVE_ID_OPTIONS,
  DISABILITY_OPTIONS,
  QUALIFICATION_OPTIONS,
  SOCIOECONOMIC_OPTIONS,
  LANGUAGE_OPTIONS,
  PROVINCE_OPTIONS,
} from '@/lib/identity/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import {
  Shield,
  User,
  FileText,
  CheckCircle,
  Upload,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Clock,
  XCircle,
  Eye,
  Building2,
  Phone,
  MapPin,
  GraduationCap,
  Heart,
  Globe,
  Lock,
  Info,
  Loader2,
  Briefcase,
  Languages,
  Users,
} from 'lucide-react';

// ============================================
// Form Data Types
// ============================================

interface FormData {
  // Personal Information
  title: PersonTitle;
  firstName: string;
  middleNames: string;
  surname: string;
  maidenName: string;
  preferredName: string;
  gender: Gender;
  dateOfBirth: string;

  // Identification
  idDocumentType: DocumentType;
  idNumber: string;
  alternativeIdType: AlternativeIdType;
  alternativeIdNumber: string;
  countryOfOrigin: string;
  citizenship: string;
  citizenStatus: CitizenStatus;
  visaType: string;

  // Equity & Language
  equityGroup: EquityGroup;
  homeLanguage: HomeLanguage;
  disabilityStatus: DisabilityStatus;
  disabilityEyesight: string;
  disabilityHearing: string;
  disabilityWalking: string;
  disabilityMemory: string;
  disabilityCommunicating: string;
  disabilitySelfCare: string;

  // Contact Information
  phoneMobile: string;
  phoneHome: string;
  phoneWork: string;
  phoneWhatsapp: string;
  emailPersonal: string;
  emailWork: string;
  preferredContactMethod: 'email' | 'phone' | 'whatsapp';

  // Physical Address
  addressBuildingName: string;
  addressUnitNumber: string;
  addressStreetNumber: string;
  addressStreetName: string;
  addressSuburb: string;
  addressCity: string;
  addressProvince: SAProvince;
  addressPostalCode: string;
  addressCountry: string;

  // Emergency Contact
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;

  // Employment
  isEmployed: boolean;
  employerName: string;
  position: string;
  yearsInPosition: string;
  supervisorName: string;
  supervisorPhone: string;
  supervisorEmail: string;

  // Education
  highestQualification: HighestQualification;
  qualificationsAttained: string;
  hasMatric: boolean;
  matricYear: string;
  socioeconomicStatus: SocioeconomicStatus;

  // Consent
  popiConsent: boolean;
  marketingConsent: boolean;
  photoConsent: boolean;
}

const initialFormData: FormData = {
  title: 'Mr',
  firstName: '',
  middleNames: '',
  surname: '',
  maidenName: '',
  preferredName: '',
  gender: 'Male',
  dateOfBirth: '',
  idDocumentType: 'sa_id_card',
  idNumber: '',
  alternativeIdType: 'Passport',
  alternativeIdNumber: '',
  countryOfOrigin: 'South Africa',
  citizenship: 'South African',
  citizenStatus: 'SA Citizen',
  visaType: '',
  equityGroup: 'African',
  homeLanguage: 'English',
  disabilityStatus: 'None',
  disabilityEyesight: '',
  disabilityHearing: '',
  disabilityWalking: '',
  disabilityMemory: '',
  disabilityCommunicating: '',
  disabilitySelfCare: '',
  phoneMobile: '',
  phoneHome: '',
  phoneWork: '',
  phoneWhatsapp: '',
  emailPersonal: '',
  emailWork: '',
  preferredContactMethod: 'email',
  addressBuildingName: '',
  addressUnitNumber: '',
  addressStreetNumber: '',
  addressStreetName: '',
  addressSuburb: '',
  addressCity: '',
  addressProvince: 'Gauteng',
  addressPostalCode: '',
  addressCountry: 'South Africa',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  isEmployed: true,
  employerName: '',
  position: '',
  yearsInPosition: '',
  supervisorName: '',
  supervisorPhone: '',
  supervisorEmail: '',
  highestQualification: 'Matric / Grade 12',
  qualificationsAttained: '',
  hasMatric: true,
  matricYear: '',
  socioeconomicStatus: 'Employed',
  popiConsent: false,
  marketingConsent: false,
  photoConsent: false,
};

// ============================================
// Step Configuration
// ============================================

const STEPS: { key: VerificationStep; label: string; icon: typeof User }[] = [
  { key: 'personal', label: 'Personal', icon: User },
  { key: 'identification', label: 'ID', icon: FileText },
  { key: 'equity', label: 'Equity', icon: Users },
  { key: 'contact', label: 'Contact', icon: Phone },
  { key: 'employment', label: 'Work', icon: Briefcase },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'documents', label: 'Documents', icon: Upload },
  { key: 'consent', label: 'Consent', icon: Lock },
  { key: 'review', label: 'Review', icon: Eye },
];

// ============================================
// Main Component
// ============================================

export default function IdentityVerificationPage() {
  const router = useRouter();
  const { user, userData, verificationStatus } = useAuth();

  // Step state
  const [currentStep, setCurrentStep] = useState<VerificationStep>('personal');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Document upload state
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [idDocumentUrl, setIdDocumentUrl] = useState<string | null>(null);
  const [idUploading, setIdUploading] = useState(false);
  const [idUploadProgress, setIdUploadProgress] = useState(0);

  const [proofOfResidence, setProofOfResidence] = useState<File | null>(null);
  const [proofOfResidenceUrl, setProofOfResidenceUrl] = useState<string | null>(null);
  const [porUploading, setPorUploading] = useState(false);
  const [porUploadProgress, setPorUploadProgress] = useState(0);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load existing data
  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        // Check if already verified or has pending verification
        if (verificationStatus === 'verified' || verificationStatus === 'pending' || verificationStatus === 'rejected') {
          setCurrentStep('review');
        }

        // Pre-fill form with existing user data
        if (userData) {
          setFormData((prev) => ({
            ...prev,
            firstName: userData.user_first_name || userData.user_name?.split(' ')[0] || '',
            surname: userData.user_surname || userData.user_name?.split(' ').slice(1).join(' ') || '',
            emailPersonal: userData.user_email || '',
            phoneMobile: userData.user_phone_number || '',
            idNumber: userData.user_id_number || '',
          }));
        }
      } catch (err) {
        console.error('Error loading verification data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, userData, verificationStatus]);

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear validation error
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Validate SA ID and auto-fill DOB/gender
  const handleIdNumberBlur = () => {
    if (formData.idDocumentType === 'sa_id' || formData.idDocumentType === 'sa_id_card') {
      const validation = validateSAID(formData.idNumber);
      if (validation.valid) {
        setFormData((prev) => ({
          ...prev,
          dateOfBirth: validation.date_of_birth || prev.dateOfBirth,
          gender: validation.gender === 'male' ? 'Male' : validation.gender === 'female' ? 'Female' : prev.gender,
          citizenStatus: validation.citizenship === 'citizen' ? 'SA Citizen' : 'Permanent Resident',
        }));
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next.idNumber;
          return next;
        });
      } else if (formData.idNumber) {
        setValidationErrors((prev) => ({
          ...prev,
          idNumber: validation.error || 'Invalid ID number',
        }));
      }
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (file: File, type: 'id' | 'proof_of_residence') => {
    if (!user) return;

    const setUploading = type === 'id' ? setIdUploading : setPorUploading;
    const setProgress = type === 'id' ? setIdUploadProgress : setPorUploadProgress;
    const setUrl = type === 'id' ? setIdDocumentUrl : setProofOfResidenceUrl;
    const documentType = type === 'id' ? formData.idDocumentType : 'proof_of_residence';

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await uploadIdentityDocument(
        user.uid,
        documentType,
        file,
        (progress: UploadProgress) => setProgress(progress.progress)
      );

      if (result.success && result.downloadUrl) {
        setUrl(result.downloadUrl);
        if (type === 'id') setIdDocument(file);
        else setProofOfResidence(file);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch {
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'proof_of_residence') => {
    const file = e.target.files?.[0];
    if (file) handleDocumentUpload(file, type);
  };

  // Step validation
  const validateStep = (step: VerificationStep): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 'personal':
        if (!formData.firstName.trim()) errors.firstName = 'First name is required';
        if (!formData.surname.trim()) errors.surname = 'Surname is required';
        if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
        break;

      case 'identification':
        if (formData.citizenStatus === 'SA Citizen') {
          if (!formData.idNumber.trim()) {
            errors.idNumber = 'SA ID number is required';
          } else {
            const validation = validateSAID(formData.idNumber);
            if (!validation.valid) errors.idNumber = validation.error || 'Invalid ID number';
          }
        } else {
          if (!formData.alternativeIdNumber.trim()) {
            errors.alternativeIdNumber = 'ID/Passport number is required';
          }
        }
        break;

      case 'equity':
        if (!formData.equityGroup) errors.equityGroup = 'Equity group is required for SETA';
        if (!formData.homeLanguage) errors.homeLanguage = 'Home language is required';
        break;

      case 'contact':
        if (!formData.phoneMobile.trim()) errors.phoneMobile = 'Mobile number is required';
        if (!formData.addressStreetName.trim()) errors.addressStreetName = 'Street name is required';
        if (!formData.addressCity.trim()) errors.addressCity = 'City is required';
        if (!formData.addressPostalCode.trim()) errors.addressPostalCode = 'Postal code is required';
        if (!formData.emergencyName.trim()) errors.emergencyName = 'Emergency contact name is required';
        if (!formData.emergencyPhone.trim()) errors.emergencyPhone = 'Emergency contact phone is required';
        break;

      case 'education':
        if (!formData.highestQualification) errors.highestQualification = 'Highest qualification is required';
        break;

      case 'documents':
        if (!idDocumentUrl) errors.idDocument = 'Please upload your ID document';
        if (!proofOfResidenceUrl) errors.proofOfResidence = 'Please upload proof of residence';
        break;

      case 'consent':
        if (!formData.popiConsent) errors.popiConsent = 'POPI consent is required';
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigate steps
  const nextStep = () => {
    if (!validateStep(currentStep)) return;

    const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].key);
      setError(null);
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].key);
      setError(null);
    }
  };

  const goToStep = (step: VerificationStep) => {
    const targetIndex = STEPS.findIndex((s) => s.key === step);
    const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

    // Only allow going back or to current step
    if (targetIndex <= currentIndex) {
      setCurrentStep(step);
    }
  };

  // Submit verification
  const handleSubmit = async () => {
    if (!user || !idDocumentUrl || !proofOfResidenceUrl) return;

    setSubmitting(true);
    setError(null);

    try {
      // In production, this would call the verification service
      // For now, we'll simulate success
      console.log('Submitting verification data:', formData);

      // Redirect to status page
      router.push('/learn');
    } catch {
      setError('Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amu-navy" />
          <p className="mt-4 text-amu-slate">Loading verification details...</p>
        </div>
      </div>
    );
  }

  // Status view for pending/verified/rejected
  if (verificationStatus === 'verified' || verificationStatus === 'pending' || verificationStatus === 'rejected') {
    return <VerificationStatusView status={verificationStatus} />;
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amu-navy">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-heading text-2xl font-semibold text-amu-navy">
          SETA Registration
        </h1>
        <p className="mt-2 text-amu-slate">
          Complete your details for official SETA registration and certification
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex items-center justify-between min-w-max px-2">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.key;
            const isPast = index < currentStepIndex;

            return (
              <div key={step.key} className="flex flex-1 items-center">
                <button
                  onClick={() => goToStep(step.key)}
                  disabled={index > currentStepIndex}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                      isActive
                        ? 'bg-amu-navy text-white'
                        : isPast
                        ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700'
                        : 'bg-amu-sky text-amu-slate'
                    }`}
                  >
                    {isPast ? <CheckCircle className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                  </div>
                  <span className={`mt-2 text-xs whitespace-nowrap ${isActive ? 'font-medium text-amu-navy' : 'text-amu-slate'}`}>
                    {step.label}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={`mx-1 h-0.5 w-4 sm:w-8 ${isPast ? 'bg-green-600' : 'bg-amu-sky'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <span className="ml-2">{error}</span>
        </Alert>
      )}

      {/* Step Content */}
      <Card className="p-6">
        {/* Step 1: Personal Details */}
        {currentStep === 'personal' && (
          <PersonalDetailsStep
            formData={formData}
            onChange={handleInputChange}
            errors={validationErrors}
          />
        )}

        {/* Step 2: Identification */}
        {currentStep === 'identification' && (
          <IdentificationStep
            formData={formData}
            onChange={handleInputChange}
            onIdBlur={handleIdNumberBlur}
            errors={validationErrors}
          />
        )}

        {/* Step 3: Equity & Language */}
        {currentStep === 'equity' && (
          <EquityStep
            formData={formData}
            onChange={handleInputChange}
            errors={validationErrors}
          />
        )}

        {/* Step 4: Contact & Address */}
        {currentStep === 'contact' && (
          <ContactStep
            formData={formData}
            onChange={handleInputChange}
            errors={validationErrors}
          />
        )}

        {/* Step 5: Employment */}
        {currentStep === 'employment' && (
          <EmploymentStep
            formData={formData}
            onChange={handleInputChange}
            errors={validationErrors}
          />
        )}

        {/* Step 6: Education */}
        {currentStep === 'education' && (
          <EducationStep
            formData={formData}
            onChange={handleInputChange}
            errors={validationErrors}
          />
        )}

        {/* Step 7: Documents */}
        {currentStep === 'documents' && (
          <DocumentsStep
            formData={formData}
            idDocument={idDocument}
            idDocumentUrl={idDocumentUrl}
            idUploading={idUploading}
            idUploadProgress={idUploadProgress}
            proofOfResidence={proofOfResidence}
            proofOfResidenceUrl={proofOfResidenceUrl}
            porUploading={porUploading}
            porUploadProgress={porUploadProgress}
            onFileChange={handleFileChange}
            onClearDocument={(type) => {
              if (type === 'id') {
                setIdDocument(null);
                setIdDocumentUrl(null);
              } else {
                setProofOfResidence(null);
                setProofOfResidenceUrl(null);
              }
            }}
            errors={validationErrors}
          />
        )}

        {/* Step 8: Consent */}
        {currentStep === 'consent' && (
          <ConsentStep
            formData={formData}
            onChange={handleInputChange}
            errors={validationErrors}
          />
        )}

        {/* Step 9: Review */}
        {currentStep === 'review' && (
          <ReviewStep formData={formData} />
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-amu-slate/20 pt-6">
          {currentStepIndex > 0 ? (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => router.push('/learn')}>
              Cancel
            </Button>
          )}

          {currentStep !== 'review' ? (
            <Button onClick={nextStep}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Submit for Verification
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

// ============================================
// Step Components
// ============================================

interface StepProps {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  errors: Record<string, string>;
}

function PersonalDetailsStep({ formData, onChange, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
          <User className="h-5 w-5" />
          Personal Details
        </h2>
        <p className="mb-6 text-sm text-amu-slate">
          Please provide your details exactly as they appear on your identity document.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <select
            id="title"
            name="title"
            value={formData.title}
            onChange={onChange}
            className="mt-1 flex h-10 w-full rounded-md border border-amu-slate/30 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amu-navy"
          >
            {TITLE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            error={!!errors.firstName}
            className="mt-1"
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="middleNames">Middle Name(s)</Label>
          <Input
            id="middleNames"
            name="middleNames"
            value={formData.middleNames}
            onChange={onChange}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="surname">Surname *</Label>
          <Input
            id="surname"
            name="surname"
            value={formData.surname}
            onChange={onChange}
            error={!!errors.surname}
            className="mt-1"
          />
          {errors.surname && <p className="mt-1 text-sm text-red-500">{errors.surname}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="maidenName">Maiden Name (if applicable)</Label>
          <Input
            id="maidenName"
            name="maidenName"
            value={formData.maidenName}
            onChange={onChange}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="preferredName">Preferred Name on Certificate</Label>
          <Input
            id="preferredName"
            name="preferredName"
            value={formData.preferredName}
            onChange={onChange}
            placeholder="Leave blank to use full legal name"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="gender">Gender *</Label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={onChange}
            className="mt-1 flex h-10 w-full rounded-md border border-amu-slate/30 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amu-navy"
          >
            {GENDER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={onChange}
            error={!!errors.dateOfBirth}
            className="mt-1"
          />
          {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
        </div>
      </div>
    </div>
  );
}

function IdentificationStep({ formData, onChange, onIdBlur, errors }: StepProps & { onIdBlur: () => void }) {
  const isSACitizen = formData.citizenStatus === 'SA Citizen';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
          <FileText className="h-5 w-5" />
          Identification
        </h2>
        <p className="mb-6 text-sm text-amu-slate">
          Your identification details are required for SETA registration.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="citizenStatus">Citizen Status *</Label>
          <select
            id="citizenStatus"
            name="citizenStatus"
            value={formData.citizenStatus}
            onChange={onChange}
            className="mt-1 flex h-10 w-full rounded-md border border-amu-slate/30 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amu-navy"
          >
            {CITIZEN_STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="countryOfOrigin">Country of Origin *</Label>
          <Input
            id="countryOfOrigin"
            name="countryOfOrigin"
            value={formData.countryOfOrigin}
            onChange={onChange}
            className="mt-1"
          />
        </div>
      </div>

      {isSACitizen ? (
        <div>
          <Label htmlFor="idDocumentType">ID Document Type *</Label>
          <select
            id="idDocumentType"
            name="idDocumentType"
            value={formData.idDocumentType}
            onChange={onChange}
            className="mt-1 flex h-10 w-full rounded-md border border-amu-slate/30 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amu-navy"
          >
            <option value="sa_id_card">South African Smart ID Card</option>
            <option value="sa_id">South African ID Book</option>
          </select>
        </div>
      ) : (
        <div>
          <Label htmlFor="alternativeIdType">ID Document Type *</Label>
          <select
            id="alternativeIdType"
            name="alternativeIdType"
            value={formData.alternativeIdType}
            onChange={onChange}
            className="mt-1 flex h-10 w-full rounded-md border border-amu-slate/30 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amu-navy"
          >
            {ALTERNATIVE_ID_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )}

      {isSACitizen ? (
        <div>
          <Label htmlFor="idNumber">SA ID Number (13 digits) *</Label>
          <Input
            id="idNumber"
            name="idNumber"
            value={formData.idNumber}
            onChange={onChange}
            onBlur={onIdBlur}
            placeholder="9001015009087"
            error={!!errors.idNumber}
            className="mt-1"
          />
          {errors.idNumber && <p className="mt-1 text-sm text-red-500">{errors.idNumber}</p>}
          <p className="mt-1 text-xs text-amu-slate">
            Your date of birth and gender will be auto-filled from your ID number
          </p>
        </div>
      ) : (
        <div>
          <Label htmlFor="alternativeIdNumber">ID/Passport Number *</Label>
          <Input
            id="alternativeIdNumber"
            name="alternativeIdNumber"
            value={formData.alternativeIdNumber}
            onChange={onChange}
            error={!!errors.alternativeIdNumber}
            className="mt-1"
          />
          {errors.alternativeIdNumber && <p className="mt-1 text-sm text-red-500">{errors.alternativeIdNumber}</p>}
        </div>
      )}

      {!isSACitizen && (
        <div>
          <Label htmlFor="visaType">Visa Type (if applicable)</Label>
          <Input
            id="visaType"
            name="visaType"
            value={formData.visaType}
            onChange={onChange}
            placeholder="e.g., Critical Skills Visa"
            className="mt-1"
          />
        </div>
      )}

      <div>
        <Label htmlFor="citizenship">Citizenship *</Label>
        <Input
          id="citizenship"
          name="citizenship"
          value={formData.citizenship}
          onChange={onChange}
          placeholder="e.g., South African"
          className="mt-1"
        />
      </div>
    </div>
  );
}

function EquityStep({ formData, onChange, errors }: StepProps) {
  const showDisabilityDetails = formData.disabilityStatus === 'Yes';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
          <Users className="h-5 w-5" />
          Equity Reporting & Language
        </h2>
        <div className="mb-6 rounded-lg bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> These fields are mandatory for SETA registration and B-BBEE
            (Broad-Based Black Economic Empowerment) compliance. This information is used for
            statistical reporting only and will not affect your learning experience.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="equityGroup">Population Group (Race) *</Label>
          <select
            id="equityGroup"
            name="equityGroup"
            value={formData.equityGroup}
            onChange={onChange}
            className={`mt-1 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-amu-navy ${
              errors.equityGroup ? 'border-red-500' : 'border-amu-slate/30'
            } bg-white`}
          >
            {EQUITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.equityGroup && <p className="mt-1 text-sm text-red-500">{errors.equityGroup}</p>}
        </div>
        <div>
          <Label htmlFor="homeLanguage">Home Language *</Label>
          <select
            id="homeLanguage"
            name="homeLanguage"
            value={formData.homeLanguage}
            onChange={onChange}
            className={`mt-1 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-amu-navy ${
              errors.homeLanguage ? 'border-red-500' : 'border-amu-slate/30'
            } bg-white`}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.homeLanguage && <p className="mt-1 text-sm text-red-500">{errors.homeLanguage}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="disabilityStatus">Disability Status *</Label>
        <select
          id="disabilityStatus"
          name="disabilityStatus"
          value={formData.disabilityStatus}
          onChange={onChange}
          className="mt-1 flex h-10 w-full rounded-md border border-amu-slate/30 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amu-navy"
        >
          {DISABILITY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {showDisabilityDetails && (
        <div className="rounded-lg border border-amu-slate/20 p-4">
          <h3 className="mb-4 text-sm font-medium text-amu-charcoal">
            Please specify the type and extent of disability (optional):
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="disabilityEyesight">Eyesight</Label>
              <Input
                id="disabilityEyesight"
                name="disabilityEyesight"
                value={formData.disabilityEyesight}
                onChange={onChange}
                placeholder="e.g., Partially sighted"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="disabilityHearing">Hearing</Label>
              <Input
                id="disabilityHearing"
                name="disabilityHearing"
                value={formData.disabilityHearing}
                onChange={onChange}
                placeholder="e.g., Hard of hearing"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="disabilityWalking">Walking/Mobility</Label>
              <Input
                id="disabilityWalking"
                name="disabilityWalking"
                value={formData.disabilityWalking}
                onChange={onChange}
                placeholder="e.g., Uses wheelchair"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="disabilityMemory">Memory/Cognitive</Label>
              <Input
                id="disabilityMemory"
                name="disabilityMemory"
                value={formData.disabilityMemory}
                onChange={onChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="disabilityCommunicating">Communicating</Label>
              <Input
                id="disabilityCommunicating"
                name="disabilityCommunicating"
                value={formData.disabilityCommunicating}
                onChange={onChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="disabilitySelfCare">Self Care</Label>
              <Input
                id="disabilitySelfCare"
                name="disabilitySelfCare"
                value={formData.disabilitySelfCare}
                onChange={onChange}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactStep({ formData, onChange, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
          <Phone className="h-5 w-5" />
          Contact Information
        </h2>
      </div>

      {/* Phone Numbers */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phoneMobile">Mobile Number *</Label>
          <Input
            id="phoneMobile"
            name="phoneMobile"
            type="tel"
            value={formData.phoneMobile}
            onChange={onChange}
            placeholder="+27 82 123 4567"
            error={!!errors.phoneMobile}
            className="mt-1"
          />
          {errors.phoneMobile && <p className="mt-1 text-sm text-red-500">{errors.phoneMobile}</p>}
        </div>
        <div>
          <Label htmlFor="phoneWhatsapp">WhatsApp Number</Label>
          <Input
            id="phoneWhatsapp"
            name="phoneWhatsapp"
            type="tel"
            value={formData.phoneWhatsapp}
            onChange={onChange}
            placeholder="Same as mobile if blank"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="phoneHome">Home Phone</Label>
          <Input
            id="phoneHome"
            name="phoneHome"
            type="tel"
            value={formData.phoneHome}
            onChange={onChange}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="phoneWork">Work Phone</Label>
          <Input
            id="phoneWork"
            name="phoneWork"
            type="tel"
            value={formData.phoneWork}
            onChange={onChange}
            className="mt-1"
          />
        </div>
      </div>

      {/* Email & Preferred Contact */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="emailWork">Work Email</Label>
          <Input
            id="emailWork"
            name="emailWork"
            type="email"
            value={formData.emailWork}
            onChange={onChange}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
          <select
            id="preferredContactMethod"
            name="preferredContactMethod"
            value={formData.preferredContactMethod}
            onChange={onChange}
            className="mt-1 flex h-10 w-full rounded-md border border-amu-slate/30 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amu-navy"
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>

      {/* Physical Address */}
      <div className="border-t border-amu-slate/20 pt-6">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
          <MapPin className="h-4 w-4" />
          Physical Address
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="addressBuildingName">Building/Complex Name</Label>
            <Input
              id="addressBuildingName"
              name="addressBuildingName"
              value={formData.addressBuildingName}
              onChange={onChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="addressUnitNumber">Unit/Flat Number</Label>
            <Input
              id="addressUnitNumber"
              name="addressUnitNumber"
              value={formData.addressUnitNumber}
              onChange={onChange}
              className="mt-1"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="addressStreetNumber">Street Number</Label>
            <Input
              id="addressStreetNumber"
              name="addressStreetNumber"
              value={formData.addressStreetNumber}
              onChange={onChange}
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="addressStreetName">Street Name *</Label>
            <Input
              id="addressStreetName"
              name="addressStreetName"
              value={formData.addressStreetName}
              onChange={onChange}
              error={!!errors.addressStreetName}
              className="mt-1"
            />
            {errors.addressStreetName && <p className="mt-1 text-sm text-red-500">{errors.addressStreetName}</p>}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="addressSuburb">Suburb</Label>
            <Input
              id="addressSuburb"
              name="addressSuburb"
              value={formData.addressSuburb}
              onChange={onChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="addressCity">City/Town *</Label>
            <Input
              id="addressCity"
              name="addressCity"
              value={formData.addressCity}
              onChange={onChange}
              error={!!errors.addressCity}
              className="mt-1"
            />
            {errors.addressCity && <p className="mt-1 text-sm text-red-500">{errors.addressCity}</p>}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="addressProvince">Province *</Label>
            <select
              id="addressProvince"
              name="addressProvince"
              value={formData.addressProvince}
              onChange={onChange}
              className="mt-1 flex h-10 w-full rounded-md border border-amu-slate/30 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amu-navy"
            >
              {PROVINCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="addressPostalCode">Postal Code *</Label>
            <Input
              id="addressPostalCode"
              name="addressPostalCode"
              value={formData.addressPostalCode}
              onChange={onChange}
              error={!!errors.addressPostalCode}
              className="mt-1"
            />
            {errors.addressPostalCode && <p className="mt-1 text-sm text-red-500">{errors.addressPostalCode}</p>}
          </div>
          <div>
            <Label htmlFor="addressCountry">Country</Label>
            <Input
              id="addressCountry"
              name="addressCountry"
              value={formData.addressCountry}
              onChange={onChange}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="border-t border-amu-slate/20 pt-6">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
          <Heart className="h-4 w-4" />
          Emergency Contact
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="emergencyName">Name *</Label>
            <Input
              id="emergencyName"
              name="emergencyName"
              value={formData.emergencyName}
              onChange={onChange}
              error={!!errors.emergencyName}
              className="mt-1"
            />
            {errors.emergencyName && <p className="mt-1 text-sm text-red-500">{errors.emergencyName}</p>}
          </div>
          <div>
            <Label htmlFor="emergencyRelationship">Relationship</Label>
            <Input
              id="emergencyRelationship"
              name="emergencyRelationship"
              value={formData.emergencyRelationship}
              onChange={onChange}
              placeholder="e.g., Spouse, Parent"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="emergencyPhone">Phone Number *</Label>
            <Input
              id="emergencyPhone"
              name="emergencyPhone"
              type="tel"
              value={formData.emergencyPhone}
              onChange={onChange}
              error={!!errors.emergencyPhone}
              className="mt-1"
            />
            {errors.emergencyPhone && <p className="mt-1 text-sm text-red-500">{errors.emergencyPhone}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmploymentStep({ formData, onChange, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
          <Briefcase className="h-5 w-5" />
          Employment Details
        </h2>
        <p className="mb-6 text-sm text-amu-slate">
          If you are employed, these details are required for workplace experience modules and triparty agreements.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isEmployed"
          name="isEmployed"
          checked={formData.isEmployed}
          onChange={onChange}
          className="h-5 w-5 rounded border-amu-slate/30 text-amu-navy focus:ring-amu-navy"
        />
        <Label htmlFor="isEmployed" className="cursor-pointer">
          I am currently employed
        </Label>
      </div>

      {formData.isEmployed && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="employerName">Employer/Company Name</Label>
              <Input
                id="employerName"
                name="employerName"
                value={formData.employerName}
                onChange={onChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="position">Your Position/Job Title</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={onChange}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="yearsInPosition">Years in Current Position</Label>
            <Input
              id="yearsInPosition"
              name="yearsInPosition"
              type="number"
              min="0"
              value={formData.yearsInPosition}
              onChange={onChange}
              className="mt-1 w-32"
            />
          </div>

          <div className="border-t border-amu-slate/20 pt-4">
            <h3 className="mb-4 text-sm font-medium text-amu-charcoal">
              Immediate Supervisor Details (for workplace mentoring)
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="supervisorName">Supervisor Name</Label>
                <Input
                  id="supervisorName"
                  name="supervisorName"
                  value={formData.supervisorName}
                  onChange={onChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="supervisorPhone">Supervisor Phone</Label>
                <Input
                  id="supervisorPhone"
                  name="supervisorPhone"
                  type="tel"
                  value={formData.supervisorPhone}
                  onChange={onChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="supervisorEmail">Supervisor Email</Label>
                <Input
                  id="supervisorEmail"
                  name="supervisorEmail"
                  type="email"
                  value={formData.supervisorEmail}
                  onChange={onChange}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EducationStep({ formData, onChange, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
          <GraduationCap className="h-5 w-5" />
          Education & Qualifications
        </h2>
        <p className="mb-6 text-sm text-amu-slate">
          Your educational background is required for SETA registration and NQF level determination.
        </p>
      </div>

      <div>
        <Label htmlFor="highestQualification">Highest Academic Qualification *</Label>
        <select
          id="highestQualification"
          name="highestQualification"
          value={formData.highestQualification}
          onChange={onChange}
          className={`mt-1 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-amu-navy ${
            errors.highestQualification ? 'border-red-500' : 'border-amu-slate/30'
          } bg-white`}
        >
          {QUALIFICATION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {errors.highestQualification && <p className="mt-1 text-sm text-red-500">{errors.highestQualification}</p>}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="hasMatric"
          name="hasMatric"
          checked={formData.hasMatric}
          onChange={onChange}
          className="h-5 w-5 rounded border-amu-slate/30 text-amu-navy focus:ring-amu-navy"
        />
        <Label htmlFor="hasMatric" className="cursor-pointer">
          I have completed Matric (Grade 12) or equivalent
        </Label>
      </div>

      {formData.hasMatric && (
        <div>
          <Label htmlFor="matricYear">Year Completed</Label>
          <Input
            id="matricYear"
            name="matricYear"
            type="number"
            min="1950"
            max={new Date().getFullYear()}
            value={formData.matricYear}
            onChange={onChange}
            placeholder="e.g., 2010"
            className="mt-1 w-32"
          />
        </div>
      )}

      <div>
        <Label htmlFor="qualificationsAttained">Other Qualifications Attained</Label>
        <textarea
          id="qualificationsAttained"
          name="qualificationsAttained"
          value={formData.qualificationsAttained}
          onChange={onChange}
          placeholder="List any other certificates, diplomas, or degrees you hold"
          rows={3}
          className="mt-1 flex w-full rounded-md border border-amu-slate/30 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amu-navy"
        />
      </div>

      <div>
        <Label htmlFor="socioeconomicStatus">Current Socioeconomic Status *</Label>
        <select
          id="socioeconomicStatus"
          name="socioeconomicStatus"
          value={formData.socioeconomicStatus}
          onChange={onChange}
          className="mt-1 flex h-10 w-full rounded-md border border-amu-slate/30 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amu-navy"
        >
          {SOCIOECONOMIC_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

interface DocumentsStepProps extends StepProps {
  idDocument: File | null;
  idDocumentUrl: string | null;
  idUploading: boolean;
  idUploadProgress: number;
  proofOfResidence: File | null;
  proofOfResidenceUrl: string | null;
  porUploading: boolean;
  porUploadProgress: number;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'proof_of_residence') => void;
  onClearDocument: (type: 'id' | 'proof_of_residence') => void;
}

function DocumentsStep({
  formData,
  idDocument,
  idDocumentUrl,
  idUploading,
  idUploadProgress,
  proofOfResidence,
  proofOfResidenceUrl,
  porUploading,
  porUploadProgress,
  onFileChange,
  onClearDocument,
  errors,
}: DocumentsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
          <Upload className="h-5 w-5" />
          Document Upload
        </h2>
        <p className="mb-6 text-sm text-amu-slate">
          Upload clear photos or scans of your identity documents. Accepted formats: JPG, PNG, PDF (max 5MB).
        </p>
      </div>

      {/* ID Document */}
      <div>
        <Label>
          {formData.citizenStatus === 'SA Citizen' ? 'South African ID Document' : 'Passport/ID Document'} *
        </Label>
        <div className="mt-2">
          {idDocumentUrl ? (
            <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-800">Document uploaded</p>
                <p className="text-sm text-green-600">{idDocument?.name}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onClearDocument('id')}>
                Replace
              </Button>
            </div>
          ) : (
            <label className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              errors.idDocument ? 'border-red-300 bg-red-50' : 'border-amu-slate/30 hover:border-amu-navy hover:bg-amu-sky/10'
            }`}>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => onFileChange(e, 'id')}
                className="hidden"
                disabled={idUploading}
              />
              {idUploading ? (
                <>
                  <Loader2 className="mb-2 h-8 w-8 animate-spin text-amu-navy" />
                  <p className="text-sm">Uploading... {idUploadProgress}%</p>
                  <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-amu-sky">
                    <div className="h-full bg-amu-navy transition-all" style={{ width: `${idUploadProgress}%` }} />
                  </div>
                </>
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-amu-slate" />
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="mt-1 text-xs text-amu-slate">JPG, PNG or PDF (max 5MB)</p>
                </>
              )}
            </label>
          )}
          {errors.idDocument && <p className="mt-2 text-sm text-red-500">{errors.idDocument}</p>}
        </div>
      </div>

      {/* Proof of Residence */}
      <div>
        <Label>Proof of Residence *</Label>
        <p className="mb-2 text-xs text-amu-slate">
          Utility bill, bank statement, or official letter (not older than 3 months)
        </p>
        <div className="mt-2">
          {proofOfResidenceUrl ? (
            <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-800">Document uploaded</p>
                <p className="text-sm text-green-600">{proofOfResidence?.name}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onClearDocument('proof_of_residence')}>
                Replace
              </Button>
            </div>
          ) : (
            <label className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              errors.proofOfResidence ? 'border-red-300 bg-red-50' : 'border-amu-slate/30 hover:border-amu-navy hover:bg-amu-sky/10'
            }`}>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => onFileChange(e, 'proof_of_residence')}
                className="hidden"
                disabled={porUploading}
              />
              {porUploading ? (
                <>
                  <Loader2 className="mb-2 h-8 w-8 animate-spin text-amu-navy" />
                  <p className="text-sm">Uploading... {porUploadProgress}%</p>
                  <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-amu-sky">
                    <div className="h-full bg-amu-navy transition-all" style={{ width: `${porUploadProgress}%` }} />
                  </div>
                </>
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-amu-slate" />
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="mt-1 text-xs text-amu-slate">JPG, PNG or PDF (max 5MB)</p>
                </>
              )}
            </label>
          )}
          {errors.proofOfResidence && <p className="mt-2 text-sm text-red-500">{errors.proofOfResidence}</p>}
        </div>
      </div>
    </div>
  );
}

function ConsentStep({ formData, onChange, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
          <Lock className="h-5 w-5" />
          Data Processing Consent
        </h2>
        <p className="mb-6 text-sm text-amu-slate">
          In accordance with the Protection of Personal Information Act (POPIA),
          we require your explicit consent to process your personal information.
        </p>
      </div>

      {/* POPI Information */}
      <div className="rounded-lg bg-amu-sky/30 p-6">
        <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
          <Info className="h-4 w-4" />
          What We Collect & Why
        </h3>
        <ul className="space-y-2 text-sm text-amu-charcoal">
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <span><strong>Personal & Identity Information:</strong> For SETA learner registration</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <span><strong>Equity Data (Race, Disability):</strong> For B-BBEE compliance reporting to SETA</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <span><strong>Employment Details:</strong> For triparty agreements and workplace experience</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <span><strong>Educational Background:</strong> For NQF level determination</span>
          </li>
        </ul>
      </div>

      {/* Data Security */}
      <div className="rounded-lg border border-amu-slate/20 p-6">
        <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
          <Shield className="h-4 w-4" />
          How We Protect Your Data
        </h3>
        <ul className="space-y-2 text-sm text-amu-charcoal">
          <li>- All data is encrypted at rest and in transit</li>
          <li>- Access is restricted to authorized personnel only</li>
          <li>- Data is shared only with SETA/CHIETA as required for registration</li>
          <li>- Your employer sees only verification status, not detailed information</li>
          <li>- You can request data access or deletion at any time</li>
        </ul>
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-4">
        <div className={`rounded-lg border-2 p-4 ${errors.popiConsent ? 'border-red-300 bg-red-50' : 'border-amu-navy/20 bg-white'}`}>
          <label className="flex cursor-pointer items-start gap-4">
            <input
              type="checkbox"
              name="popiConsent"
              checked={formData.popiConsent}
              onChange={onChange}
              className="mt-1 h-5 w-5 rounded border-amu-slate/30 text-amu-navy focus:ring-amu-navy"
            />
            <div>
              <p className="font-medium text-amu-charcoal">
                I consent to the processing of my personal information *
              </p>
              <p className="mt-1 text-sm text-amu-slate">
                I understand that my personal information will be processed for SETA registration,
                B-BBEE compliance reporting, and certification purposes in accordance with POPIA.
              </p>
            </div>
          </label>
          {errors.popiConsent && <p className="mt-2 text-sm text-red-500">{errors.popiConsent}</p>}
        </div>

        <div className="rounded-lg border border-amu-slate/20 bg-white p-4">
          <label className="flex cursor-pointer items-start gap-4">
            <input
              type="checkbox"
              name="marketingConsent"
              checked={formData.marketingConsent}
              onChange={onChange}
              className="mt-1 h-5 w-5 rounded border-amu-slate/30 text-amu-navy focus:ring-amu-navy"
            />
            <div>
              <p className="font-medium text-amu-charcoal">
                I consent to receive marketing communications (optional)
              </p>
              <p className="mt-1 text-sm text-amu-slate">
                We may send you information about new courses, certifications, and learning opportunities.
              </p>
            </div>
          </label>
        </div>

        <div className="rounded-lg border border-amu-slate/20 bg-white p-4">
          <label className="flex cursor-pointer items-start gap-4">
            <input
              type="checkbox"
              name="photoConsent"
              checked={formData.photoConsent}
              onChange={onChange}
              className="mt-1 h-5 w-5 rounded border-amu-slate/30 text-amu-navy focus:ring-amu-navy"
            />
            <div>
              <p className="font-medium text-amu-charcoal">
                I consent to use of my photograph for marketing (optional)
              </p>
              <p className="mt-1 text-sm text-amu-slate">
                Your profile photo may be used in success stories and promotional materials.
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ formData }: { formData: FormData }) {
  const fullName = `${formData.title} ${formData.firstName} ${formData.middleNames} ${formData.surname}`.replace(/\s+/g, ' ').trim();
  const isSACitizen = formData.citizenStatus === 'SA Citizen';
  const idDisplay = isSACitizen
    ? `${formData.idNumber.substring(0, 6)}*******`
    : formData.alternativeIdNumber;

  const fullAddress = [
    formData.addressUnitNumber && `Unit ${formData.addressUnitNumber}`,
    formData.addressBuildingName,
    formData.addressStreetNumber,
    formData.addressStreetName,
    formData.addressSuburb,
    formData.addressCity,
    formData.addressProvince,
    formData.addressPostalCode,
  ].filter(Boolean).join(', ');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
          <Eye className="h-5 w-5" />
          Review Your SETA Registration Data
        </h2>
        <p className="mb-6 text-sm text-amu-slate">
          Please review all information before submitting. This data will be used for your official SETA registration.
        </p>
      </div>

      {/* Personal Details */}
      <div className="rounded-lg border border-amu-slate/20 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
          <User className="h-4 w-4" />
          Personal Details
        </h3>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-amu-slate">Full Name</dt><dd className="font-medium">{fullName}</dd></div>
          <div><dt className="text-amu-slate">Gender</dt><dd className="font-medium">{formData.gender}</dd></div>
          <div><dt className="text-amu-slate">Date of Birth</dt><dd className="font-medium">{formData.dateOfBirth}</dd></div>
          {formData.preferredName && <div><dt className="text-amu-slate">Certificate Name</dt><dd className="font-medium">{formData.preferredName}</dd></div>}
        </dl>
      </div>

      {/* Identification */}
      <div className="rounded-lg border border-amu-slate/20 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
          <FileText className="h-4 w-4" />
          Identification
        </h3>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-amu-slate">Citizen Status</dt><dd className="font-medium">{formData.citizenStatus}</dd></div>
          <div><dt className="text-amu-slate">ID Number</dt><dd className="font-medium">{idDisplay}</dd></div>
          <div><dt className="text-amu-slate">Citizenship</dt><dd className="font-medium">{formData.citizenship}</dd></div>
          <div><dt className="text-amu-slate">Country of Origin</dt><dd className="font-medium">{formData.countryOfOrigin}</dd></div>
        </dl>
      </div>

      {/* Equity & Language */}
      <div className="rounded-lg border border-amu-slate/20 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
          <Users className="h-4 w-4" />
          Equity Reporting (B-BBEE)
        </h3>
        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          <div><dt className="text-amu-slate">Population Group</dt><dd className="font-medium">{formData.equityGroup}</dd></div>
          <div><dt className="text-amu-slate">Home Language</dt><dd className="font-medium">{formData.homeLanguage}</dd></div>
          <div><dt className="text-amu-slate">Disability Status</dt><dd className="font-medium">{formData.disabilityStatus}</dd></div>
        </dl>
      </div>

      {/* Contact */}
      <div className="rounded-lg border border-amu-slate/20 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
          <Phone className="h-4 w-4" />
          Contact Information
        </h3>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-amu-slate">Mobile</dt><dd className="font-medium">{formData.phoneMobile}</dd></div>
          {formData.phoneWhatsapp && <div><dt className="text-amu-slate">WhatsApp</dt><dd className="font-medium">{formData.phoneWhatsapp}</dd></div>}
          <div className="sm:col-span-2"><dt className="text-amu-slate">Address</dt><dd className="font-medium">{fullAddress}</dd></div>
        </dl>
      </div>

      {/* Emergency Contact */}
      <div className="rounded-lg border border-amu-slate/20 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
          <Heart className="h-4 w-4" />
          Emergency Contact
        </h3>
        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          <div><dt className="text-amu-slate">Name</dt><dd className="font-medium">{formData.emergencyName}</dd></div>
          <div><dt className="text-amu-slate">Relationship</dt><dd className="font-medium">{formData.emergencyRelationship || 'Not specified'}</dd></div>
          <div><dt className="text-amu-slate">Phone</dt><dd className="font-medium">{formData.emergencyPhone}</dd></div>
        </dl>
      </div>

      {/* Employment */}
      {formData.isEmployed && formData.employerName && (
        <div className="rounded-lg border border-amu-slate/20 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
            <Briefcase className="h-4 w-4" />
            Employment
          </h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-amu-slate">Employer</dt><dd className="font-medium">{formData.employerName}</dd></div>
            <div><dt className="text-amu-slate">Position</dt><dd className="font-medium">{formData.position}</dd></div>
            {formData.supervisorName && <div><dt className="text-amu-slate">Supervisor</dt><dd className="font-medium">{formData.supervisorName}</dd></div>}
          </dl>
        </div>
      )}

      {/* Education */}
      <div className="rounded-lg border border-amu-slate/20 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
          <GraduationCap className="h-4 w-4" />
          Education
        </h3>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-amu-slate">Highest Qualification</dt><dd className="font-medium">{formData.highestQualification}</dd></div>
          <div><dt className="text-amu-slate">Matric Completed</dt><dd className="font-medium">{formData.hasMatric ? `Yes${formData.matricYear ? ` (${formData.matricYear})` : ''}` : 'No'}</dd></div>
          <div><dt className="text-amu-slate">Socioeconomic Status</dt><dd className="font-medium">{formData.socioeconomicStatus}</dd></div>
        </dl>
      </div>

      {/* Documents */}
      <div className="rounded-lg border border-amu-slate/20 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
          <Upload className="h-4 w-4" />
          Documents Uploaded
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm">ID Document</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm">Proof of Residence</span>
          </div>
        </div>
      </div>

      {/* Consent Summary */}
      <div className="rounded-lg bg-green-50 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            POPI consent provided on {new Date().toLocaleDateString('en-ZA')}
          </span>
        </div>
        {formData.marketingConsent && (
          <p className="mt-1 text-sm text-green-700">+ Marketing communications consent</p>
        )}
        {formData.photoConsent && (
          <p className="mt-1 text-sm text-green-700">+ Photo usage consent</p>
        )}
      </div>
    </div>
  );
}

// ============================================
// Verification Status View
// ============================================

function VerificationStatusView({ status }: { status: VerificationStatus }) {
  const router = useRouter();

  const statusConfig = {
    none: {
      icon: Shield,
      iconBg: 'bg-amu-slate/20',
      iconColor: 'text-amu-slate',
      title: 'Not Started',
      description: "You haven't started the identity verification process yet.",
    },
    pending: {
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      title: 'Pending Review',
      description: 'Your verification documents are being reviewed. This typically takes 1-2 business days.',
    },
    verified: {
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Verified - Tier 3',
      description: 'Your identity has been verified. You are now eligible for SETA registration and official certificates.',
    },
    rejected: {
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      title: 'Verification Rejected',
      description: 'Your verification was not approved. Please review the reason below and resubmit.',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <Card className="overflow-hidden">
        <div className={`${config.iconBg} px-6 py-8 text-center`}>
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white ${config.iconColor}`}>
            <StatusIcon className="h-10 w-10" />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-amu-navy">{config.title}</h1>
          <p className="mt-2 text-amu-charcoal">{config.description}</p>
        </div>

        <div className="p-6">
          {status === 'verified' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4">
                <h3 className="mb-2 font-heading text-sm font-semibold text-green-800">
                  Tier 3 Benefits Unlocked
                </h3>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>- Official SETA-recognised certificates</li>
                  <li>- Your employer can claim Skills Development Act tax rebates</li>
                  <li>- Your achievements are recorded on the national qualifications database</li>
                </ul>
              </div>
              <Button className="w-full" onClick={() => router.push('/learn')}>
                Continue Learning
              </Button>
            </div>
          )}

          {status === 'pending' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-amber-50 p-4">
                <h3 className="mb-2 font-heading text-sm font-semibold text-amber-800">
                  What happens next?
                </h3>
                <ul className="space-y-1 text-sm text-amber-700">
                  <li>- AI-assisted verification will check your documents</li>
                  <li>- Our team will do a final review</li>
                  <li>- You will receive an email once verified</li>
                  <li>- You can continue learning while you wait</li>
                </ul>
              </div>
              <Button variant="outline" className="w-full" onClick={() => router.push('/learn')}>
                Continue Learning
              </Button>
            </div>
          )}

          {status === 'rejected' && (
            <div className="space-y-4">
              <Alert variant="error">
                <AlertCircle className="h-4 w-4" />
                <span className="ml-2">Please ensure your documents are clear, legible, and not expired.</span>
              </Alert>
              <Button className="w-full" onClick={() => window.location.reload()}>
                Resubmit Verification
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
