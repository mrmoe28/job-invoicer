'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';

interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
  plan: 'free' | 'pro' | 'enterprise';
  agreeToTerms: boolean;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    plan: 'free',
    agreeToTerms: false,
  });
  
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Personal Info, 2: Organization Info, 3: Plan Selection
  const router = useRouter();

  // tRPC mutation hook
  const signupMutation = trpc.signup.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        // Store user session
        localStorage.setItem('pulse_user', JSON.stringify({
          id: result.user.id,
          email: result.user.email,
          name: `${result.user.firstName} ${result.user.lastName}`,
          role: result.user.role,
          organizationId: result.organization.id,
          organizationName: result.organization.name,
          organizationSlug: result.organization.slug,
          plan: result.organization.plan,
        }));

        // Redirect to dashboard
        router.push('/dashboard');
      }
    },
    onError: (error) => {
      setError(error.message || 'Something went wrong. Please try again.');
    },
  });

  const validateStep1 = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Invalid email address';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const validateStep2 = () => {
    if (!formData.organizationName.trim()) return 'Organization name is required';
    if (!formData.agreeToTerms) return 'You must agree to the terms of service';
    return null;
  };

  const handleNext = () => {
    setError('');
    
    if (step === 1) {
      const error = validateStep1();
      if (error) {
        setError(error);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const error = validateStep2();
      if (error) {
        setError(error);
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    signupMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      organizationName: formData.organizationName,
      plan: formData.plan,
    });
  };

  const updateFormData = (field: keyof SignupForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Pulse<span className="text-orange-500">CRM</span>
            </h1>
          </div>
          <h2 className="text-xl text-gray-300 mb-2">Create your crew workspace</h2>
          <p className="text-gray-400">Join thousands of construction teams using PulseCRM</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= stepNumber 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-8 h-1 ${
                  step > stepNumber ? 'bg-orange-500' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          )}

          {/* Step 2: Organization Information */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Organization Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.organizationName}
                  onChange={(e) => updateFormData('organizationName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="ABC Construction Company"
                />
                <p className="text-xs text-gray-400 mt-1">
                  This will be your workspace name that team members will see
                </p>
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 bg-gray-800 rounded"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                  I agree to the{' '}
                  <Link href="/terms" className="text-orange-500 hover:text-orange-400">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-orange-500 hover:text-orange-400">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Plan Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Choose Your Plan</h3>
              
              <div className="space-y-3">
                {[
                  {
                    id: 'free',
                    name: 'Free',
                    price: '$0',
                    period: '/month',
                    features: ['Up to 5 team members', 'Up to 50 jobs', '1GB storage'],
                    recommended: false,
                  },
                  {
                    id: 'pro',
                    name: 'Professional',
                    price: '$29',
                    period: '/month',
                    features: ['Up to 50 team members', 'Up to 500 jobs', '100GB storage', 'Advanced reporting'],
                    recommended: true,
                  },
                  {
                    id: 'enterprise',
                    name: 'Enterprise',
                    price: '$99',
                    period: '/month',
                    features: ['Unlimited team members', 'Unlimited jobs', '1TB storage', 'Priority support'],
                    recommended: false,
                  },
                ].map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.plan === plan.id
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                    }`}
                    onClick={() => updateFormData('plan', plan.id)}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-2 left-4 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                        Recommended
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-semibold">{plan.name}</h4>
                        <p className="text-gray-400 text-sm">{plan.features.join(' • ')}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">
                          {plan.price}<span className="text-gray-400 text-sm">{plan.period}</span>
                        </div>
                      </div>
                    </div>
                    
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={formData.plan === plan.id}
                      onChange={() => updateFormData('plan', plan.id)}
                      className="sr-only"
                    />
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 text-center">
                You can upgrade or downgrade your plan at any time
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {signupMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            )}
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/auth" className="text-orange-500 hover:text-orange-400 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}