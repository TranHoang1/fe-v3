'use client';

import { ReactNode } from 'react';
import ImageUpload from '../ImageUpload';
import { Trash2 } from 'lucide-react';

interface ImageDetailFieldProps {
  label: string;
  value?: string;
  isEditing?: boolean;
  onChange?: (file: File | null) => void;
  onDelete?: () => void;
  className?: string;
}

export function ImageDetailField({
  label,
  value,
  isEditing = false,
  onChange,
  onDelete,
  className = ''
}: ImageDetailFieldProps) {
  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-gray-400">{label}:</span>
        <ImageUpload
          initialImage={value}
          onImageChange={onChange ?? (() => {})}
          className="w-full aspect-video max-w-md"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-gray-400">{label}:</span>
      {value ? (
        <div className="relative w-full max-w-md">
          <img
            src={value}
            alt={label}
            className="w-full aspect-video object-cover rounded-lg"
          />
          {onDelete && (
            <button
              onClick={onDelete}
              className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 focus:outline-none transition-colors"
              type="button"
              title="Delete image"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ) : (
        <span className="text-gray-500">No image</span>
      )}
    </div>
  );
}
