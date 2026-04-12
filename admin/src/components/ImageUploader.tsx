import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import api, { BACKEND_BASE_URL } from "../services/api";
import { toast } from "../utils/toast";
import clsx from "clsx";

const BACKEND = BACKEND_BASE_URL;

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  className?: string;
  accept?: string;
}

export default function ImageUploader({
  value,
  onChange,
  onRemove,
  label = "Upload Image",
  className,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onChange(res.data.url);
      } catch {
        toast.error("Upload failed. Try again.");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (value) {
    return (
      <div
        className={clsx(
          "relative group rounded-2xl overflow-hidden border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5",
          className
        )}
      >
        <img
          src={value.startsWith("http") ? value : `${BACKEND}${value}`}
          alt="upload"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="p-3 bg-white rounded-xl text-slate-900 hover:bg-slate-100 transition-all shadow-lg"
          >
            <Upload className="w-4 h-4" />
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-3 bg-rose-600 rounded-xl text-white hover:bg-rose-700 transition-all shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFile}
        />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "relative rounded-2xl border-2 border-dashed transition-all cursor-pointer group",
        dragging
          ? "border-blue-600 bg-blue-600/5"
          : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-blue-400 hover:bg-blue-600/5",
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
    >
      <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 text-center">
        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-bold text-blue-600">Uploading...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-700 dark:text-slate-300">
                {label}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PNG, JPG, GIF up to 5MB · Drag & drop or click
              </p>
            </div>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFile}
      />
    </div>
  );
}
