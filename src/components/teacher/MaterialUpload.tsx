"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatFileSize, getFileIcon } from "@/lib/utils";

interface UploadedFile {
  file: File;
  progress: number;
  status: "uploading" | "uploaded" | "error";
  error?: string;
}

interface MaterialUploadProps {
  onFilesUploaded: (files: File[]) => void;
  existingFiles?: { name: string; size: number; url: string }[];
  onRemoveExisting?: (index: number) => void;
}

export default function MaterialUpload({
  onFilesUploaded,
  existingFiles = [],
  onRemoveExisting,
}: MaterialUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validExtensions = [".pdf", ".docx", ".pptx", ".txt"];
      const maxSize = 10 * 1024 * 1024; // 10MB

      const validFiles: File[] = [];
      const newUploadedFiles: UploadedFile[] = [];

      acceptedFiles.forEach((file) => {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();

        if (!validExtensions.includes(ext)) {
          newUploadedFiles.push({
            file,
            progress: 0,
            status: "error",
            error: `Invalid file type: ${ext}. Allowed: PDF, DOCX, PPTX, TXT`,
          });
          return;
        }

        if (file.size > maxSize) {
          newUploadedFiles.push({
            file,
            progress: 0,
            status: "error",
            error: "File too large (max 10MB)",
          });
          return;
        }

        validFiles.push(file);
        newUploadedFiles.push({
          file,
          progress: 0,
          status: "uploading",
        });
      });

      setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);

      // Simulate upload progress
      newUploadedFiles.forEach((uf, idx) => {
        if (uf.status === "error") return;
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30 + 10;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.file === uf.file
                  ? { ...f, progress: 100, status: "uploaded" }
                  : f
              )
            );
          } else {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.file === uf.file ? { ...f, progress } : f
              )
            );
          }
        }, 200);
      });

      if (validFiles.length > 0) {
        onFilesUploaded(validFiles);
      }
    },
    [onFilesUploaded]
  );

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  });

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? "border-volcano-500 bg-volcano-500/10"
            : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3">📂</div>
        {isDragActive ? (
          <p className="text-volcano-300 font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-white font-medium mb-1">
              Drag & drop files here
            </p>
            <p className="text-slate-400 text-sm">
              or click to browse files
            </p>
            <p className="text-slate-500 text-xs mt-2">
              Supported: PDF, DOCX, PPTX, TXT (max 10MB)
            </p>
          </>
        )}
      </div>

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">
            Uploaded Materials
          </h4>
          {existingFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{getFileIcon(file.name)}</span>
                <div>
                  <p className="text-white text-sm font-medium">{file.name}</p>
                  <p className="text-slate-400 text-xs">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              {onRemoveExisting && (
                <button
                  onClick={() => onRemoveExisting(idx)}
                  className="text-slate-400 hover:text-lava-400 transition-colors p-1"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">New Files</h4>
          {uploadedFiles.map((uf, idx) => (
            <div
              key={idx}
              className="bg-slate-800 rounded-xl px-4 py-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {getFileIcon(uf.file.name)}
                  </span>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {uf.file.name}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {formatFileSize(uf.file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {uf.status === "uploaded" && (
                    <span className="text-forest-400 text-sm">✓</span>
                  )}
                  {uf.status === "error" && (
                    <span className="text-lava-400 text-sm">✕</span>
                  )}
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-slate-400 hover:text-lava-400 transition-colors p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {uf.status === "uploading" && (
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div
                    className="bg-volcano-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uf.progress}%` }}
                  />
                </div>
              )}

              {uf.status === "error" && uf.error && (
                <p className="text-lava-400 text-xs mt-1">{uf.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
