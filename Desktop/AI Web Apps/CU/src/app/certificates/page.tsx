'use client'

import { Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface Certificate {
  id: string
  name: string
  domain: string
  expiry: Date
  status: 'valid' | 'expiring' | 'expired'
}

export default function CertificatesPage() {
  const certificates: Certificate[] = [
    {
      id: '1',
      name: 'Primary SSL',
      domain: '*.example.com',
      expiry: new Date('2024-12-31'),
      status: 'valid'
    },
    {
      id: '2',
      name: 'API Gateway',
      domain: 'api.example.com',
      expiry: new Date('2024-04-15'),
      status: 'expiring'
    },
    {
      id: '3',
      name: 'Legacy Service',
      domain: 'legacy.example.com',
      expiry: new Date('2024-01-01'),
      status: 'expired'
    }
  ]

  const getStatusIcon = (status: Certificate['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="text-green-500" size={20} />
      case 'expiring':
        return <Clock className="text-yellow-500" size={20} />
      case 'expired':
        return <AlertTriangle className="text-red-500" size={20} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="text-green-500" size={24} />
          Certificates
        </h1>
        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
          Add Certificate
        </button>
      </div>

      <div className="grid gap-4">
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">{cert.name}</h2>
              {getStatusIcon(cert.status)}
            </div>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Domain</span>
                <span className="font-mono">{cert.domain}</span>
              </div>
              <div className="flex justify-between">
                <span>Expiry</span>
                <span className="font-mono">
                  {cert.expiry.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 