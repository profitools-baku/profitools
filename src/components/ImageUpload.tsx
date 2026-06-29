import { useState, useRef, useCallback } from "react";
import { Upload, Link as LinkIcon, X, Loader2, Image as ImageIcon, Check } from "lucide-react";
import { toast } from "sonner";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  onClose: () => void;
}

export function ImageUpload({ onUpload, onClose }: ImageUploadProps) {
  const [mode, setMode] = useState<"file" | "url">("file");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setTempImage(reader.result as string);
    });
    reader.readAsDataURL(file);
  };

  const handleConfirmCrop = async () => {
    if (!tempImage || !croppedAreaPixels) return;

    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(tempImage, croppedAreaPixels);
      const formData = new FormData();
      formData.append("file", croppedBlob, "product-image.jpg");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      onUpload(data.url);
      onClose();
    } catch (err) {
      toast.error("Failed to process image");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 transition-all ${tempImage ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">
            {tempImage ? "Crop Image (3:4)" : "Add Image"}
          </h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          {!tempImage ? (
            <>
              <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setMode("file")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === "file" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setMode("url")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === "url" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  Image URL
                </button>
              </div>

              {mode === "file" ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed bg-orange-50/30 border-orange-200 hover:border-orange-400 hover:bg-orange-50/50 rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="w-7 h-7 text-orange-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Click to browse</p>
                  <p className="text-xs text-slate-500 text-center">PNG, JPG, WEBP up to 50MB</p>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    let targetUrl = url.trim();
                    
                    // Smart extraction for BBCode [img]...[/img]
                    const bbMatch = targetUrl.match(/\[img\](.*?)\[\/img\]/i);
                    if (bbMatch && bbMatch[1]) {
                      targetUrl = bbMatch[1].trim();
                    }
                    
                    // Smart extraction for Markdown ![alt](url)
                    const mdMatch = targetUrl.match(/!\[.*?\]\((.*?)\)/i);
                    if (mdMatch && mdMatch[1]) {
                      targetUrl = mdMatch[1].trim();
                    }

                    if (targetUrl) {
                      onUpload(targetUrl);
                      onClose();
                    }
                  }} 
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Direct Link to Image</label>
                    <input
                      type="text"
                      autoFocus
                      placeholder="https://example.com/image.jpg"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm"
                    />
                    <p className="mt-2 text-[10px] text-slate-400 italic">
                      Tip: You can paste BBCode [img] or Markdown links here too!
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={!url.trim()}
                    className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:shadow-none"
                  >
                    Add Image
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="relative h-[400px] w-full bg-slate-100 rounded-xl overflow-hidden">
                <Cropper
                  image={tempImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={3 / 4}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Zoom</label>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTempImage(null)}
                    disabled={uploading}
                    className="px-6 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCrop}
                    disabled={uploading}
                    className="px-6 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Apply & Upload
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
