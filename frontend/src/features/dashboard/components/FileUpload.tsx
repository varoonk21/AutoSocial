import { useState } from 'react'
import { useFileUpload } from '../hooks/useFileUpload'
import { cn } from '@/lib/utils'
import type { FileUploadProps } from '@/types/upload'

export function FileUpload({
  accept = 'image/*',
  multiple = false,
  onUpload,
  onError,
  children,
  className,
  dropzoneClassName,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const { uploading, progress, inputRef, uploadFiles, openPicker, handleInputChange } = useFileUpload({
    onUpload,
    onError,
  })

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
  }

  return (
    <div className={cn('relative', className)}>
      <div
        onClick={openPicker}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'cursor-pointer transition-colors',
          dragOver && 'ring-2 ring-primary-400 ring-offset-2',
          uploading && 'pointer-events-none opacity-50',
          dropzoneClassName,
        )}
      >
        {children}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleInputChange}
      />

      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl z-10">
          <div className="text-center space-y-1">
            <p className="text-xs font-medium text-gray-600">Uploading...</p>
            {progress > 0 && (
              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
