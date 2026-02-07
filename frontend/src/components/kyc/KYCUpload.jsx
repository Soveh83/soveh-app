import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Camera, FileCheck, AlertCircle, CheckCircle, 
  X, Loader2, Shield, Eye, RefreshCw 
} from 'lucide-react';
import { kycAPI } from '../../lib/api';
import { Button, Card, Badge } from '../ui';
import toast from 'react-hot-toast';

const DOCUMENT_TYPES = [
  { id: 'trade_license', name: 'Trade License', required: true, icon: FileCheck },
  { id: 'shop_photo', name: 'Shop Photo', required: true, icon: Camera },
  { id: 'id_proof', name: 'ID Proof (Aadhaar/PAN)', required: false, icon: Shield },
  { id: 'gst_certificate', name: 'GST Certificate', required: false, icon: FileCheck }
];

export const KYCUpload = ({ userId, onComplete }) => {
  const [step, setStep] = useState(0);
  const [documents, setDocuments] = useState({});
  const [uploading, setUploading] = useState(false);
  const [verificationResults, setVerificationResults] = useState({});
  const fileInputRef = useRef(null);
  const [currentDocType, setCurrentDocType] = useState(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file || !currentDocType) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result.split(',')[1];
      setDocuments(prev => ({
        ...prev,
        [currentDocType]: { file, base64, preview: e.target.result }
      }));
      
      // Auto-upload and verify
      await uploadAndVerify(currentDocType, base64);
    };
    reader.readAsDataURL(file);
  };

  const uploadAndVerify = async (docType, base64) => {
    setUploading(true);
    try {
      const response = await kycAPI.uploadDocument(docType, base64, userId);
      const result = response.data;
      
      setVerificationResults(prev => ({
        ...prev,
        [docType]: result
      }));
      
      if (result.status === 'verified') {
        toast.success(`${DOCUMENT_TYPES.find(d => d.id === docType)?.name} verified!`);
      } else if (result.status === 'rejected') {
        toast.error(`Verification failed: ${result.issues?.join(', ') || 'Please try again'}`);
      } else {
        toast('Document submitted for manual review');
      }
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const openFileSelector = (docType) => {
    setCurrentDocType(docType);
    fileInputRef.current?.click();
  };

  const getStatusBadge = (docType) => {
    const result = verificationResults[docType];
    if (!result) return null;
    
    switch (result.status) {
      case 'verified':
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>;
      case 'rejected':
        return <Badge variant="error"><X className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'manual_review':
        return <Badge variant="warning"><Eye className="w-3 h-3 mr-1" /> Under Review</Badge>;
      default:
        return <Badge><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing</Badge>;
    }
  };

  const allRequiredUploaded = DOCUMENT_TYPES
    .filter(d => d.required)
    .every(d => verificationResults[d.id]?.status === 'verified' || verificationResults[d.id]?.status === 'manual_review');

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4"
        >
          <Shield className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-xl font-bold text-slate-900">KYC Verification</h2>
        <p className="text-slate-500 mt-1">Upload documents to verify your business</p>
      </div>

      {/* AI Verification Banner */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </motion.div>
          </div>
          <div>
            <p className="font-semibold text-purple-900">AI-Powered Verification</p>
            <p className="text-sm text-purple-700">Documents verified instantly using AI</p>
          </div>
        </div>
      </Card>

      {/* Document Upload Cards */}
      <div className="space-y-3">
        {DOCUMENT_TYPES.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    documents[doc.id] ? 'bg-emerald-100' : 'bg-slate-100'
                  }`}>
                    {documents[doc.id] ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <doc.icon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{doc.name}</p>
                    <p className="text-sm text-slate-500">
                      {doc.required ? 'Required' : 'Optional'}
                    </p>
                    {getStatusBadge(doc.id)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {documents[doc.id]?.preview && (
                    <img 
                      src={documents[doc.id].preview} 
                      alt={doc.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <Button
                    size="sm"
                    variant={documents[doc.id] ? 'outline' : 'primary'}
                    role="retailer"
                    onClick={() => openFileSelector(doc.id)}
                    disabled={uploading && currentDocType === doc.id}
                    data-testid={`upload-${doc.id}`}
                  >
                    {uploading && currentDocType === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : documents[doc.id] ? (
                      'Replace'
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-1" /> Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Verification Details */}
              {verificationResults[doc.id]?.extracted_info && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-3 pt-3 border-t border-slate-100"
                >
                  <p className="text-xs font-medium text-slate-500 mb-2">AI Extracted Info:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(verificationResults[doc.id].extracted_info).map(([key, value]) => (
                      <div key={key} className="bg-slate-50 px-2 py-1 rounded">
                        <span className="text-slate-500">{key}:</span>{' '}
                        <span className="text-slate-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Issues */}
              {verificationResults[doc.id]?.issues?.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-3 p-3 bg-amber-50 rounded-xl"
                >
                  <p className="text-xs font-medium text-amber-700 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> Issues Found:
                  </p>
                  <ul className="text-xs text-amber-600 mt-1 list-disc list-inside">
                    {verificationResults[doc.id].issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Confidence Score */}
      {Object.keys(verificationResults).length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Verification Progress</span>
            <span className="text-sm font-bold text-blue-600">
              {Math.round(
                Object.values(verificationResults)
                  .filter(r => r.status === 'verified')
                  .length / DOCUMENT_TYPES.filter(d => d.required).length * 100
              )}%
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${
                  Object.values(verificationResults)
                    .filter(r => r.status === 'verified')
                    .length / DOCUMENT_TYPES.filter(d => d.required).length * 100
                }%` 
              }}
              className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
            />
          </div>
        </Card>
      )}

      {/* Complete Button */}
      {allRequiredUploaded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            fullWidth
            size="lg"
            role="customer"
            onClick={onComplete}
            data-testid="kyc-complete-btn"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Complete Verification
          </Button>
        </motion.div>
      )}
    </div>
  );
};
