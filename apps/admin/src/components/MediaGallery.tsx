import { useState, useRef, useCallback } from "react";
import { api } from "../lib/api";
import { Upload, X, Loader2, Link2, Star, ImageIcon } from "lucide-react";
import MediaPicker from "./media/MediaPicker";

interface MediaItem {
    url: string;
    id?: string;
}

interface MediaGalleryProps {
    value: string | string[];
    onChange: (value: string | string[]) => void;
    category?: string;
    label?: string;
    hint?: string;
    maxImages?: number;
    aspectRatio?: "square" | "video" | "banner" | "portrait";
    gridCols?: 2 | 3 | 4;
    showUrlInput?: boolean;
    allowThumbnailSelection?: boolean;
    thumbnailIndex?: number;
    onThumbnailChange?: (index: number) => void;
}

export default function MediaGallery({
    value,
    onChange,
    category = "media",
    label = "Görseller",
    hint,
    maxImages = 1,
    aspectRatio = "video",
    gridCols = 3,
    showUrlInput = true,
    allowThumbnailSelection = false,
    thumbnailIndex = 0,
    onThumbnailChange,
}: MediaGalleryProps) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isSingle = maxImages === 1;
    const images: MediaItem[] = isSingle
        ? (value ? [{ url: value as string }] : [])
        : (Array.isArray(value) ? value.map((url, idx) => ({ url, id: `img-${idx}` })) : []);

    const canAddMore = images.length < maxImages;

    const aspectClasses = {
        square: "aspect-square",
        video: "aspect-video",
        banner: "aspect-[3/1]",
        portrait: "aspect-[3/4]",
    };

    const gridColsClass = {
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
    };

    const handleFileSelect = useCallback(async (files: FileList) => {
        const filesToUpload = Array.from(files).slice(0, maxImages - images.length);
        
        if (filesToUpload.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            const uploadPromises = filesToUpload.map(async (file) => {
                if (!file.type.startsWith("image/")) {
                    throw new Error(`${file.name} bir görsel dosyası değil`);
                }
                if (file.size > 10 * 1024 * 1024) {
                    throw new Error(`${file.name} 10MB'dan büyük`);
                }
                const result = await api.uploadMedia(file, category);
                return result.data.url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);

            if (isSingle) {
                onChange(uploadedUrls[0]);
            } else {
                const currentUrls = Array.isArray(value) ? value : [];
                onChange([...currentUrls, ...uploadedUrls]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Yükleme başarısız");
        } finally {
            setUploading(false);
        }
    }, [category, onChange, images.length, maxImages, isSingle, value]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
        }
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFileSelect(e.target.files);
        }
    }, [handleFileSelect]);

    const handleRemove = (index: number) => {
        if (isSingle) {
            onChange("");
        } else {
            const currentUrls = Array.isArray(value) ? value : [];
            onChange(currentUrls.filter((_, i) => i !== index));
        }
    };

    const handleUrlSubmit = () => {
        if (!urlInput.trim()) return;

        if (isSingle) {
            onChange(urlInput.trim());
        } else {
            const currentUrls = Array.isArray(value) ? value : [];
            onChange([...currentUrls, urlInput.trim()]);
        }

        setUrlInput("");
        setShowUrlModal(false);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
                    {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
                </div>
                <div className="text-xs text-slate-400">
                    {images.length}/{maxImages}
                </div>
            </div>

            {/* Images Grid - Compact */}
            {images.length > 0 && (
                <div className={`grid ${gridColsClass[gridCols]} gap-2`}>
                    {images.map((img, idx) => (
                        <div
                            key={img.id || idx}
                            className="relative group rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:border-indigo-400 transition-all hover:shadow-md"
                        >
                            <div className={`${aspectClasses[aspectRatio]} relative`}>
                                <img
                                    src={img.url}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                {/* Actions */}
                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {allowThumbnailSelection && (
                                        <button
                                            type="button"
                                            onClick={() => onThumbnailChange?.(idx)}
                                            className={`w-6 h-6 rounded-md flex items-center justify-center shadow-md transition-colors ${
                                                thumbnailIndex === idx
                                                    ? "bg-amber-500 text-white"
                                                    : "bg-white/90 text-slate-600 hover:bg-amber-100"
                                            }`}
                                            title="Thumbnail olarak ayarla"
                                        >
                                            <Star size={12} fill={thumbnailIndex === idx ? "currentColor" : "none"} />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(idx)}
                                        className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center shadow-md transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>

                                {/* Badges */}
                                <div className="absolute bottom-1 left-1 flex gap-1">
                                    {!isSingle && (
                                        <div className="px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded font-medium">
                                            #{idx + 1}
                                        </div>
                                    )}
                                    {allowThumbnailSelection && thumbnailIndex === idx && (
                                        <div className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] rounded font-medium flex items-center gap-0.5">
                                            <Star size={8} fill="currentColor" />
                                            Thumbnail
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Area - Compact */}
            {canAddMore && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${
                        dragOver
                            ? "border-indigo-500 bg-indigo-50/50 scale-[1.02]"
                            : "border-slate-200 bg-slate-50/30 hover:border-indigo-300 hover:bg-slate-50"
                    }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple={!isSingle}
                        onChange={handleInputChange}
                        className="hidden"
                    />

                    {uploading ? (
                        <div className="flex items-center justify-center py-3">
                            <Loader2 size={24} className="text-indigo-500 animate-spin mr-2" />
                            <p className="text-xs text-slate-600 font-medium">Yükleniyor...</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-linear-to-br from-indigo-50 to-purple-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Upload size={18} className="text-indigo-600" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-xs font-semibold text-slate-700">
                                        Görsel yükle
                                    </h4>
                                    <p className="text-[10px] text-slate-400">
                                        PNG, JPG, WEBP • Max 10MB
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                >
                                    <Upload size={12} />
                                    Dosya
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowPicker(true)}
                                    className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 border border-violet-200"
                                >
                                    <ImageIcon size={12} />
                                    Kütüphane
                                </button>

                                {showUrlInput && (
                                    <button
                                        type="button"
                                        onClick={() => setShowUrlModal(true)}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <Link2 size={12} />
                                        URL
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs text-red-600">{error}</p>
                </div>
            )}

            {/* Media Picker Dialog */}
            <MediaPicker
                open={showPicker}
                onClose={() => setShowPicker(false)}
                imagesOnly
                multiple={!isSingle}
                onSelect={(url) => {
                    if (isSingle) {
                        onChange(url);
                    } else {
                        const currentUrls = Array.isArray(value) ? value : [];
                        onChange([...currentUrls, url]);
                    }
                }}
                onSelectMultiple={(urls) => {
                    const currentUrls = Array.isArray(value) ? value : [];
                    onChange([...currentUrls, ...urls]);
                }}
            />

            {/* URL Modal */}
            {showUrlModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowUrlModal(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Görsel URL'i Ekle</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-2">
                                    Görsel URL
                                </label>
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleUrlSubmit}
                                    className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors"
                                >
                                    Ekle
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowUrlModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
                                >
                                    İptal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
