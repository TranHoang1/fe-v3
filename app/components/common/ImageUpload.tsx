'use client';

import React, { useState, useCallback } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface ImageUploadProps {
  initialImage?: string;
  onImageChange: (file: File | null) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  initialImage,
  onImageChange,
  className = ''
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    // File type validation
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    onImageChange(file);
  }, [onImageChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    onImageChange(null);
  }, [onImageChange]);

  return (
    <div
      className={`relative bg-[#1e1e1e] rounded-lg border-2 border-dashed 
        ${isDragging ? 'border-blue-500 bg-[#252525]' : 'border-[#3c3c3c]'} 
        ${className}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full
              hover:bg-red-600 focus:outline-none transition-colors"
            type="button"
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
          <ImagePlus className="w-10 h-10 text-gray-400 mb-3" />
          <span className="text-sm text-gray-400 text-center">
            Drag and drop an image here
            <br />
            or click to select
          </span>
          <span className="mt-2 text-xs text-gray-500">
            Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
          </span>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
          />
        </label>
      )}
    </div>
  );
};

export default ImageUpload;
