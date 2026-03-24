import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api, resolveMediaUrl } from "../lib/api";
import DataTable, { SiteLabels, Toggle } from "../components/DataTable";
import { Star, Package, Info } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ProductsPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<Record<string, string | number>>({
        site_id: "all",
        brand: "all"
    });
    const [showConfirm, setShowConfirm] = useState<{ id: number; title: string; nextState: boolean } | null>(null);

    const queryClient = useQueryClient();

    const { data: productsRes, isLoading: itemsLoading } = useQuery({
        queryKey: ["products"],
        queryFn: () => api.getProducts(),
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, is_active }: { id: number, is_active: boolean }) =>
            api.updateProduct(id, { is_active }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        }
    });

    const handleToggleStatus = (id: number, title: string, current: boolean) => {
        setShowConfirm({ id, title, nextState: !current });
    };

    const confirmStatusChange = () => {
        if (!showConfirm) return;
        toggleMutation.mutate({ id: showConfirm.id, is_active: showConfirm.nextState });
        setShowConfirm(null);
    };

    const { data: sitesRes } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    const products = productsRes?.data || [];
    const sites = sitesRes?.data || [];

    // Distinct brands for filter options
    const brands = useMemo(() => {
        const unique = Array.from(new Set(products.map((p: any) => p.brand).filter(Boolean)));
        return unique.sort().map(b => ({ label: String(b), value: String(b) }));
    }, [products]);

    // Local filtering
    const filteredData = useMemo(() => {
        return products.filter((p: any) => {
            const siteMatch = filters.site_id === "all" ||
                (p.sites?.some((s: any) => String(s.id) === String(filters.site_id)));
            const brandMatch = filters.brand === "all" || p.brand === filters.brand;
            return siteMatch && brandMatch;
        });
    }, [products, filters]);

    const columns = [
        {
            key: "title",
            label: "Ürün Bilgisi",
            render: (v: string, row: any) => (
                <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100/80 overflow-hidden shrink-0 flex items-center justify-center transition-all group-hover:bg-white group-hover:shadow-sm">
                        {row.image_url ? (
                            <img 
                                src={resolveMediaUrl(row.image_url)} 
                                alt="" 
                                className="absolute inset-0 w-full h-full object-contain p-1" 
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.classList.add('flex');
                                    e.currentTarget.parentElement?.classList.add('items-center');
                                    e.currentTarget.parentElement?.classList.add('justify-center');
                                }}
                            />
                        ) : (
                            <Package size={22} strokeWidth={1.5} className="text-slate-300" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="font-bold text-slate-800 text-[13.5px] tracking-tight leading-tight">{v}</div>
                            {row.is_featured && (
                                <Star size={14} className="text-amber-400 fill-amber-400 ml-0.5" />
                            )}
                            {row.stock_quantity !== null && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                                    row.stock_quantity === 0 
                                        ? 'bg-rose-50 text-rose-600 border-rose-200' 
                                        : row.stock_quantity < 5
                                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                }`}>
                                    {row.stock_quantity === 0 ? 'Stokta Yok' : row.stock_quantity < 5 ? `Son ${row.stock_quantity}` : `Stok: ${row.stock_quantity}`}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                            {row.brand && (
                                <span className="text-[11.5px] font-bold text-indigo-600/80 uppercase tracking-widest">{row.brand}</span>
                            )}
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100/50 px-1.5 py-0.5 rounded-md border border-slate-200/50">{row.sku || "KOD YOK"}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: "sites",
            label: "Aktif Siteler",
            render: (v: any) => <SiteLabels sites={v} />
        },
        {
            key: "price",
            label: "Fiyat",
            width: "120px",
            render: (v: number) =>
                v ? (
                    <div className="font-bold text-slate-900 text-[14px]">
                        ₺{v.toLocaleString("tr-TR")}
                    </div>
                ) : (
                    <span className="text-slate-300 text-xs">—</span>
                ),
        },
        {
            key: "is_active",
            label: "Yayında",
            width: "100px",
            render: (v: boolean, row: any) => (
                <Toggle
                    checked={!!v}
                    onChange={() => handleToggleStatus(row.id, row.title, !!v)}
                    disabled={toggleMutation.isPending}
                />
            )
        }
    ];

    const filterGroups = [
        {
            key: "site_id",
            label: "Site",
            pluralLabel: "Siteler",
            options: sites.map((s: any) => ({ label: s.name, value: String(s.id) }))
        },
        {
            key: "brand",
            label: "Marka",
            pluralLabel: "Markalar",
            options: brands
        }
    ];

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <>
            <DataTable
                title="Ürünler"
                description="Global ürün kataloğu ve envanter yönetimi"
                columns={columns}
                data={filteredData}
                isLoading={itemsLoading}
                onAdd={() => navigate("/products/new")}
                onEdit={(row) => navigate(`/products/${row.id}/edit`)}
                addLabel="Yeni Ürün Ekle"
                filters={filterGroups}
                activeFilters={filters}
                onFilterChange={handleFilterChange}
            />

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${showConfirm.nextState ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                <Info size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Durum Değişikliği</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                <span className="text-slate-900 font-bold">"{showConfirm.title}"</span> isimli ürünün durumunu <span className={showConfirm.nextState ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{showConfirm.nextState ? 'Aktif' : 'Pasif'}</span> olarak değiştirmek istediğinize emin misiniz?
                            </p>
                        </div>
                        <div className="flex border-t border-slate-100 p-4 gap-3 bg-slate-50/50">
                            <button
                                onClick={() => setShowConfirm(null)}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all border border-transparent hover:border-slate-200"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={confirmStatusChange}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all ${showConfirm.nextState ? 'bg-emerald-500 shadow-emerald-200 hover:bg-emerald-600' : 'bg-rose-500 shadow-rose-200 hover:bg-rose-600'}`}
                            >
                                Evet, Onayla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
