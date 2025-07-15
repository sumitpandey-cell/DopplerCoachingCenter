'use client';

import React, { useState } from 'react';
import { uploadFile } from '@/firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete: (url: string, fileName: string) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onUploadComplete, 
  acceptedTypes = '.pdf,.doc,.docx,.ppt,.pptx',
  maxSize = 10 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const path = `materials/${Date.now()}_${file.name}`;
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const downloadURL = await uploadFile(file, path);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      onUploadComplete(downloadURL, file.name);
      setFile(null);
      setProgress(0);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file-upload">Upload File</Label>
        <Input
          id="file-upload"
          type="file"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          disabled={uploading}
          className="mt-1"
        />
        <p className="text-sm text-gray-500 mt-1">
          Accepted formats: {acceptedTypes}. Max size: {maxSize}MB
        </p>
      </div>

      {file && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <File className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">{file.name}</span>
            <span className="text-xs text-gray-500">
              ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
          {!uploading && (
            <Button variant="ghost" size="sm" onClick={removeFile}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600">Uploading... {progress}%</p>
        </div>
      )}

      <Button 
        onClick={handleUpload} 
        disabled={!file || uploading}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? 'Uploading...' : 'Upload File'}
      </Button>
    </div>
  );
};

export default FileUpload;