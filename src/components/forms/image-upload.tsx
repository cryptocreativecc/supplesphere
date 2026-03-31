"use client";

import { useState, useRef } from "react";

export function ImageUpload({
  images,
  onChange,
  maxImages = 4,
}: {
  images: File[];
  onChange: (files: File[]) => void;
  maxImages?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, maxImages - images.length);
    const updated = [...images, ...newFiles];
    onChange(updated);

    // Generate previews
    const newPreviews = [...previews];
    for (const file of newFiles) {
      const url = URL.createObjectURL(file);
      newPreviews.push(url);
    }
    setPreviews(newPreviews);
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
    if (previews[index]) URL.revokeObjectURL(previews[index]);
    setPreviews(previews.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {previews.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 transition hover:border-accent-teal/30 hover:bg-accent-teal/5"
          >
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="mt-1 text-xs text-neutral-400">Add image</p>
            </div>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-neutral-400">
        {images.length}/{maxImages} images
      </p>
    </div>
  );
}
