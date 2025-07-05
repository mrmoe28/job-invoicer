'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Send } from 'lucide-react';

interface Signer {
  name: string;
  email: string;
}

interface AddSignersModalProps {
  documentId: string;
  documentName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddSignersModal({
  documentId,
  documentName,
  onClose,
  onSuccess
}: AddSignersModalProps) {
  const [signers, setSigners] = useState<Signer[]>([{ name: '', email: '' }]);
  const [loading, setLoading] = useState(false);

  const addSigner = () => {
    setSigners([...signers, { name: '', email: '' }]);
  };

  const removeSigner = (index: number) => {
    setSigners(signers.filter((_, i) => i !== index));
  };

  const updateSigner = (index: number, field: keyof Signer, value: string) => {
    const updated = [...signers];
    updated[index][field] = value;
    setSigners(updated);
  };

  const handleSubmit = async () => {
    // Validate all signers
    const validSigners = signers.filter(s => s.name && s.email);
    if (validSigners.length === 0) {
      alert('Please add at least one signer with name and email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/signers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signers: validSigners }),
      });

      if (response.ok) {
        alert('Signers added successfully!');
        onSuccess();
        onClose();
      } else {
        alert('Failed to add signers');
      }
    } catch (error) {
      console.error('Error adding signers:', error);
      alert('Failed to add signers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Add Signers</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Add people who need to sign &quot;{documentName}&quot;
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {signers.map((signer, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Name"
                    value={signer.name}
                    onChange={(e) => updateSigner(index, 'name', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="Email"
                    value={signer.email}
                    onChange={(e) => updateSigner(index, 'email', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                {signers.length > 1 && (
                  <button
                    onClick={() => removeSigner(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                    aria-label="Remove signer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addSigner}
            className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 flex items-center justify-center gap-2 text-gray-600"
          >
            <Plus className="h-4 w-4" />
            Add Another Signer
          </button>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {loading ? 'Sending...' : 'Send for Signing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
