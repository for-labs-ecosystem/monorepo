import { Image, Upload, Link, FileSearch } from "lucide-react";

const features = [
    { icon: Upload, title: "Dosya Yükleme", desc: "Sürükle-bırak veya seç ile R2'ye yükleme" },
    { icon: Link, title: "CDN URL'leri", desc: "Cloudflare CDN üzerinden hızlı erişim" },
    { icon: FileSearch, title: "Metadata", desc: "Tenant, tip, boyut bilgileri D1'de saklanır" },
    { icon: Image, title: "Görsel Önizleme", desc: "Thumbnail ve galeri görünümü" },
];

export default function MediaPage() {
    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Medya Kütüphanesi</h1>
                <p className="page-subtitle">R2 bucket üzerindeki PDF, görsel ve dosyaların merkezi yönetimi</p>
            </div>

            <div className="card p-12 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5">
                    <Image size={28} className="text-indigo-500" strokeWidth={1.5} />
                </div>
                <h2 className="text-base font-semibold text-slate-800 mb-2">Medya Kütüphanesi</h2>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    SDS/TDS dökümanları, ürün görselleri ve proje fotoğraflarını buradan yükleyip yönetebileceksiniz.
                    Dosyalar tenant-aware klasör yapısıyla R2 bucket'a depolanacak.
                </p>
                <div className="grid grid-cols-2 gap-3 text-left">
                    {features.map((f) => {
                        const Icon = f.icon;
                        return (
                            <div key={f.title} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <Icon size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                                <div>
                                    <p className="text-xs font-medium text-slate-700">{f.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className="text-xs text-slate-400 mt-6 italic">Faz 4'te aktif edilecek</p>
            </div>
        </div>
    );
}
