import { useState, useRef } from 'react';
import { useUploadEventPhoto, useDeleteEventPhoto, useGetEventPhotos } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function EventPhotoUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<bigint | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadEventPhoto = useUploadEventPhoto();
  const deleteEventPhoto = useDeleteEventPhoto();
  const { data: existingPhotos = [], isLoading: loadingPhotos } = useGetEventPhotos();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    for (const file of files) {
      // Check file type
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid image format. Please use JPG, PNG, or WebP.`);
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }

      validFiles.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image to upload');
      return;
    }

    try {
      const totalFiles = selectedFiles.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i];
        const progress = Math.round(((i + 1) / totalFiles) * 100);
        setUploadProgress(progress);
        
        toast.info(`Uploading ${file.name}... (${i + 1}/${totalFiles})`);
        await uploadEventPhoto.mutateAsync(file);
      }

      toast.success(`Successfully uploaded ${totalFiles} photo${totalFiles > 1 ? 's' : ''}!`);
      
      // Clean up
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload photos. Please try again.');
      setUploadProgress(0);
    }
  };

  const handleDeleteClick = (photoId: bigint) => {
    setPhotoToDelete(photoId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (photoToDelete === null) return;

    try {
      await deleteEventPhoto.mutateAsync(photoToDelete);
      toast.success('Photo deleted successfully');
      setDeleteConfirmOpen(false);
      setPhotoToDelete(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete photo. Please try again.');
    }
  };

  return (
    <>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-xl text-navy flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Manage Event Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Photos Section */}
          {existingPhotos.length > 0 && (
            <div>
              <h4 className="font-semibold text-navy mb-3">
                Current Event Photos ({existingPhotos.length} photo{existingPhotos.length !== 1 ? 's' : ''})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingPhotos.map((photo) => (
                  <div key={photo.id.toString()} className="relative group">
                    <img
                      src={photo.blob.getDirectURL()}
                      alt={photo.filename}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect fill="%23f3f4f6" width="300" height="300"/%3E%3Ctext x="150" y="150" font-family="Arial" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <button
                      onClick={() => handleDeleteClick(photo.id)}
                      disabled={deleteEventPhoto.isPending}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      aria-label="Delete photo"
                    >
                      {deleteEventPhoto.isPending && photoToDelete === photo.id ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Photos Section */}
          <div>
            <h4 className="font-semibold text-navy mb-3">Upload New Photos</h4>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gold transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="event-photo-upload"
              />
              <label htmlFor="event-photo-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to select photos or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, or WebP (max 5MB each)
                </p>
              </label>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div>
              <h4 className="font-semibold text-navy mb-3">
                Selected Photos ({selectedFiles.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {selectedFiles[index].name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gold h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploadEventPhoto.isPending}
            className="w-full"
          >
            {uploadEventPhoto.isPending 
              ? `Uploading... ${uploadProgress}%` 
              : `Upload ${selectedFiles.length} Photo${selectedFiles.length !== 1 ? 's' : ''}`}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPhotoToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
