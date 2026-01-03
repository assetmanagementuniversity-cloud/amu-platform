'use client';

/**
 * Identity Data Edit Page - AMU Platform
 *
 * Privacy-First Self-Service (Sections 1.3, 10.3)
 *
 * Learners can view and edit their OWN SETA data here.
 * NO admin can ever access this data - only the learner themselves.
 *
 * "Ubuntu - I am because we are"
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import {
  ArrowLeft,
  Save,
  Loader2,
  Shield,
  AlertCircle,
  CheckCircle,
  User,
  FileText,
  Phone,
  MapPin,
  GraduationCap,
  Heart,
  Briefcase,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  TITLE_OPTIONS,
  GENDER_OPTIONS,
  EQUITY_OPTIONS,
  CITIZEN_STATUS_OPTIONS,
  DISABILITY_OPTIONS,
  QUALIFICATION_OPTIONS,
  SOCIOECONOMIC_OPTIONS,
  LANGUAGE_OPTIONS,
  PROVINCE_OPTIONS,
} from '@/lib/identity/types';

type EditSection = 'personal' | 'identification' | 'equity' | 'contact' | 'employment' | 'education';

export default function EditIdentityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<EditSection>('personal');
  const [showIdNumber, setShowIdNumber] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [originalData, setOriginalData] = useState<Record<string, unknown>>({});

  // Dispute info
  const [hasDispute, setHasDispute] = useState(false);
  const [disputeGuidance, setDisputeGuidance] = useState<string | null>(null);
  const [fieldsToReview, setFieldsToReview] = useState<string[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/settings/identity/edit');
    }
  }, [user, authLoading, router]);

  // Load user data and dispute info
  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        // Fetch user's SETA data
        const dataRes = await fetch('/api/verification/my-data', {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        });

        if (dataRes.ok) {
          const { data } = await dataRes.json();
          setFormData(data);
          setOriginalData(data);
        }

        // Fetch dispute info
        const disputeRes = await fetch('/api/verification/dispute-guidance', {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        });

        if (disputeRes.ok) {
          const { data } = await disputeRes.json();
          setHasDispute(data.hasDispute);
          if (data.hasDispute) {
            setDisputeGuidance(data.guidance);
            setFieldsToReview(data.fieldsToReview || []);
          }
        }
      } catch (err) {
        setError('Failed to load your data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  // Update form field
  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuccess(null);
  };

  // Check if field has changed
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  // Check if a field needs attention
  const needsAttention = (fieldName: string) => {
    return fieldsToReview.some((f) =>
      fieldName.toLowerCase().includes(f.toLowerCase().replace(/\s+/g, '_'))
    );
  };

  // Save changes
  const handleSave = async () => {
    if (!user || !hasChanges()) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/verification/my-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to save changes');
      }

      const { needsResubmission } = await res.json();
      setOriginalData(formData);
      setSuccess(
        needsResubmission
          ? 'Changes saved. Please re-submit for verification.'
          : 'Your changes have been saved.'
      );
    } catch (err) {
      setError('Failed to save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amu-navy" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const sections: { id: EditSection; label: string; icon: React.ElementType }[] = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'identification', label: 'ID', icon: FileText },
    { id: 'equity', label: 'Equity', icon: Shield },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-amu-sky/20 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/settings/identity')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-heading text-2xl font-semibold text-amu-navy">
                Edit Your Information
              </h1>
              <p className="text-sm text-amu-slate">
                Your data is private - only you can see and edit this.
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges() || saving}
            className="bg-amu-navy"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Dispute Alert */}
        {hasDispute && disputeGuidance && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <div className="ml-2">
              <h3 className="font-heading text-sm font-semibold text-amber-800">
                Action Required
              </h3>
              <p className="mt-1 text-sm text-amber-700">{disputeGuidance}</p>
              {fieldsToReview.length > 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  Fields to check: {fieldsToReview.join(', ')}
                </p>
              )}
            </div>
          </Alert>
        )}

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="ml-2 text-sm text-green-700">{success}</span>
          </Alert>
        )}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="ml-2 text-sm text-red-700">{error}</span>
          </Alert>
        )}

        {/* Section Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSection(section.id)}
              className={activeSection === section.id ? 'bg-amu-navy' : ''}
            >
              <section.icon className="mr-2 h-4 w-4" />
              {section.label}
            </Button>
          ))}
        </div>

        {/* Edit Form */}
        <Card className="p-6">
          {/* Personal Section */}
          {activeSection === 'personal' && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                <User className="h-5 w-5" />
                Personal Details
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className={needsAttention('title') ? 'text-amber-600' : ''}>
                    Title {needsAttention('title') && '*'}
                  </Label>
                  <select
                    value={(formData.user_title as string) || ''}
                    onChange={(e) => updateField('user_title', e.target.value)}
                    className="mt-1 w-full rounded-md border border-amu-slate/30 p-2"
                  >
                    <option value="">Select...</option>
                    {TITLE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className={needsAttention('first_name') ? 'text-amber-600' : ''}>
                    First Name {needsAttention('first_name') && '*'}
                  </Label>
                  <Input
                    value={(formData.user_first_name as string) || ''}
                    onChange={(e) => updateField('user_first_name', e.target.value)}
                    className={needsAttention('first_name') ? 'border-amber-400' : ''}
                  />
                </div>

                <div>
                  <Label>Middle Names</Label>
                  <Input
                    value={(formData.user_middle_names as string) || ''}
                    onChange={(e) => updateField('user_middle_names', e.target.value)}
                  />
                </div>

                <div>
                  <Label className={needsAttention('surname') ? 'text-amber-600' : ''}>
                    Surname {needsAttention('surname') && '*'}
                  </Label>
                  <Input
                    value={(formData.user_surname as string) || ''}
                    onChange={(e) => updateField('user_surname', e.target.value)}
                    className={needsAttention('surname') ? 'border-amber-400' : ''}
                  />
                </div>

                <div>
                  <Label className={needsAttention('gender') ? 'text-amber-600' : ''}>
                    Gender {needsAttention('gender') && '*'}
                  </Label>
                  <select
                    value={(formData.user_gender as string) || ''}
                    onChange={(e) => updateField('user_gender', e.target.value)}
                    className="mt-1 w-full rounded-md border border-amu-slate/30 p-2"
                  >
                    <option value="">Select...</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className={needsAttention('date_of_birth') ? 'text-amber-600' : ''}>
                    Date of Birth {needsAttention('date_of_birth') && '*'}
                  </Label>
                  <Input
                    type="date"
                    value={(formData.user_date_of_birth as string) || ''}
                    onChange={(e) => updateField('user_date_of_birth', e.target.value)}
                    className={needsAttention('date_of_birth') ? 'border-amber-400' : ''}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Identification Section */}
          {activeSection === 'identification' && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                <FileText className="h-5 w-5" />
                Identification
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className={needsAttention('citizen_status') ? 'text-amber-600' : ''}>
                    Citizen Status {needsAttention('citizen_status') && '*'}
                  </Label>
                  <select
                    value={(formData.user_citizen_status as string) || ''}
                    onChange={(e) => updateField('user_citizen_status', e.target.value)}
                    className="mt-1 w-full rounded-md border border-amu-slate/30 p-2"
                  >
                    <option value="">Select...</option>
                    {CITIZEN_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className={needsAttention('id_number') ? 'text-amber-600' : ''}>
                    ID Number {needsAttention('id_number') && '*'}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showIdNumber ? 'text' : 'password'}
                      value={(formData.user_id_number as string) || ''}
                      onChange={(e) => updateField('user_id_number', e.target.value)}
                      className={needsAttention('id_number') ? 'border-amber-400 pr-10' : 'pr-10'}
                      placeholder="13-digit SA ID"
                    />
                    <button
                      type="button"
                      onClick={() => setShowIdNumber(!showIdNumber)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-amu-slate"
                    >
                      {showIdNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-amu-slate">
                    Your ID number is encrypted and protected.
                  </p>
                </div>

                <div>
                  <Label>Country of Origin</Label>
                  <Input
                    value={(formData.user_country_of_origin as string) || ''}
                    onChange={(e) => updateField('user_country_of_origin', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Citizenship</Label>
                  <Input
                    value={(formData.user_citizenship as string) || ''}
                    onChange={(e) => updateField('user_citizenship', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Equity Section */}
          {activeSection === 'equity' && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                <Shield className="h-5 w-5" />
                Equity & Accessibility
              </h2>

              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                This information is required for B-BBEE compliance and SETA reporting.
                It will never be shared externally without your consent.
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className={needsAttention('equity_group') ? 'text-amber-600' : ''}>
                    Population Group {needsAttention('equity_group') && '*'}
                  </Label>
                  <select
                    value={(formData.user_equity_group as string) || ''}
                    onChange={(e) => updateField('user_equity_group', e.target.value)}
                    className="mt-1 w-full rounded-md border border-amu-slate/30 p-2"
                  >
                    <option value="">Select...</option>
                    {EQUITY_OPTIONS.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className={needsAttention('home_language') ? 'text-amber-600' : ''}>
                    Home Language {needsAttention('home_language') && '*'}
                  </Label>
                  <select
                    value={(formData.user_home_language as string) || ''}
                    onChange={(e) => updateField('user_home_language', e.target.value)}
                    className="mt-1 w-full rounded-md border border-amu-slate/30 p-2"
                  >
                    <option value="">Select...</option>
                    {LANGUAGE_OPTIONS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Label className={needsAttention('disability_status') ? 'text-amber-600' : ''}>
                    Disability Status {needsAttention('disability_status') && '*'}
                  </Label>
                  <select
                    value={(formData.user_disability_status as string) || ''}
                    onChange={(e) => updateField('user_disability_status', e.target.value)}
                    className="mt-1 w-full rounded-md border border-amu-slate/30 p-2"
                  >
                    <option value="">Select...</option>
                    {DISABILITY_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Contact Section */}
          {activeSection === 'contact' && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                <Phone className="h-5 w-5" />
                Contact Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className={needsAttention('phone') ? 'text-amber-600' : ''}>
                    Mobile Phone {needsAttention('phone') && '*'}
                  </Label>
                  <Input
                    value={(formData.user_phone_number as string) || ''}
                    onChange={(e) => updateField('user_phone_number', e.target.value)}
                    placeholder="0XX XXX XXXX"
                  />
                </div>

                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={(formData.user_phone_whatsapp as string) || ''}
                    onChange={(e) => updateField('user_phone_whatsapp', e.target.value)}
                    placeholder="0XX XXX XXXX"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label>Work Email</Label>
                  <Input
                    type="email"
                    value={(formData.user_email_work as string) || ''}
                    onChange={(e) => updateField('user_email_work', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
                  <MapPin className="h-4 w-4" />
                  Physical Address
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Street Address</Label>
                    <Input
                      value={(formData.user_address as Record<string, string>)?.street_name || ''}
                      onChange={(e) =>
                        updateField('user_address', {
                          ...(formData.user_address as Record<string, string> || {}),
                          street_name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Suburb</Label>
                    <Input
                      value={(formData.user_address as Record<string, string>)?.suburb || ''}
                      onChange={(e) =>
                        updateField('user_address', {
                          ...(formData.user_address as Record<string, string> || {}),
                          suburb: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>City</Label>
                    <Input
                      value={(formData.user_address as Record<string, string>)?.city || ''}
                      onChange={(e) =>
                        updateField('user_address', {
                          ...(formData.user_address as Record<string, string> || {}),
                          city: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Province</Label>
                    <select
                      value={(formData.user_address as Record<string, string>)?.province || ''}
                      onChange={(e) =>
                        updateField('user_address', {
                          ...(formData.user_address as Record<string, string> || {}),
                          province: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-md border border-amu-slate/30 p-2"
                    >
                      <option value="">Select...</option>
                      {PROVINCE_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Postal Code</Label>
                    <Input
                      value={(formData.user_address as Record<string, string>)?.postal_code || ''}
                      onChange={(e) =>
                        updateField('user_address', {
                          ...(formData.user_address as Record<string, string> || {}),
                          postal_code: e.target.value,
                        })
                      }
                      placeholder="0000"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
                  <Heart className="h-4 w-4" />
                  Emergency Contact
                </h3>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={(formData.user_emergency_contact as Record<string, string>)?.name || ''}
                      onChange={(e) =>
                        updateField('user_emergency_contact', {
                          ...(formData.user_emergency_contact as Record<string, string> || {}),
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Relationship</Label>
                    <Input
                      value={(formData.user_emergency_contact as Record<string, string>)?.relationship || ''}
                      onChange={(e) =>
                        updateField('user_emergency_contact', {
                          ...(formData.user_emergency_contact as Record<string, string> || {}),
                          relationship: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={(formData.user_emergency_contact as Record<string, string>)?.phone_number || ''}
                      onChange={(e) =>
                        updateField('user_emergency_contact', {
                          ...(formData.user_emergency_contact as Record<string, string> || {}),
                          phone_number: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employment Section */}
          {activeSection === 'employment' && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                <Briefcase className="h-5 w-5" />
                Employment Details
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Employer Name</Label>
                  <Input
                    value={(formData.user_employment as Record<string, string>)?.company_name || ''}
                    onChange={(e) =>
                      updateField('user_employment', {
                        ...(formData.user_employment as Record<string, string> || {}),
                        company_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Position</Label>
                  <Input
                    value={(formData.user_employment as Record<string, string>)?.position || ''}
                    onChange={(e) =>
                      updateField('user_employment', {
                        ...(formData.user_employment as Record<string, string> || {}),
                        position: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Supervisor Name</Label>
                  <Input
                    value={(formData.user_employment as Record<string, string>)?.supervisor_name || ''}
                    onChange={(e) =>
                      updateField('user_employment', {
                        ...(formData.user_employment as Record<string, string> || {}),
                        supervisor_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Supervisor Phone</Label>
                  <Input
                    value={(formData.user_employment as Record<string, string>)?.supervisor_phone || ''}
                    onChange={(e) =>
                      updateField('user_employment', {
                        ...(formData.user_employment as Record<string, string> || {}),
                        supervisor_phone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Education Section */}
          {activeSection === 'education' && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                <GraduationCap className="h-5 w-5" />
                Education
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className={needsAttention('highest_qualification') ? 'text-amber-600' : ''}>
                    Highest Qualification {needsAttention('highest_qualification') && '*'}
                  </Label>
                  <select
                    value={(formData.user_highest_qualification as string) || ''}
                    onChange={(e) => updateField('user_highest_qualification', e.target.value)}
                    className="mt-1 w-full rounded-md border border-amu-slate/30 p-2"
                  >
                    <option value="">Select...</option>
                    {QUALIFICATION_OPTIONS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className={needsAttention('socioeconomic_status') ? 'text-amber-600' : ''}>
                    Socioeconomic Status {needsAttention('socioeconomic_status') && '*'}
                  </Label>
                  <select
                    value={(formData.user_socioeconomic_status as string) || ''}
                    onChange={(e) => updateField('user_socioeconomic_status', e.target.value)}
                    className="mt-1 w-full rounded-md border border-amu-slate/30 p-2"
                  >
                    <option value="">Select...</option>
                    {SOCIOECONOMIC_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Matric Completed?</Label>
                  <select
                    value={formData.user_has_matric ? 'yes' : 'no'}
                    onChange={(e) => updateField('user_has_matric', e.target.value === 'yes')}
                    className="mt-1 w-full rounded-md border border-amu-slate/30 p-2"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <Label>Matric Year</Label>
                  <Input
                    type="number"
                    value={(formData.user_matric_year as number) || ''}
                    onChange={(e) => updateField('user_matric_year', parseInt(e.target.value) || null)}
                    placeholder="e.g., 2015"
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Privacy Notice */}
        <div className="mt-6 rounded-lg bg-amu-navy/5 p-4 text-center">
          <Shield className="mx-auto mb-2 h-6 w-6 text-amu-navy" />
          <p className="text-sm text-amu-slate">
            <strong>Your privacy is protected.</strong> No administrator can view your personal
            data. Only you can see and edit this information.
          </p>
        </div>
      </div>
    </div>
  );
}
