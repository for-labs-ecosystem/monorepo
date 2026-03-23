import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { User, MapPin, ShoppingBag, Heart, LogOut, Save, Plus, X, Building2, Loader2, Check, Package, FileText, Clock, ChevronRight, AlertTriangle, MessageSquare, Send, Pencil } from 'lucide-react'
import { useLanguage, t, localizedField } from '@/lib/i18n'
import { useMemberAuth } from '@/lib/auth'
import { useProducts } from '@/hooks/useProducts'
import { getImageUrl } from '@/lib/utils'
import type { MemberProfile } from '@/lib/auth'

const API_BASE = import.meta.env.VITE_API_URL as string
const SITE_ID = import.meta.env.VITE_SITE_ID as string

type Tab = 'orders' | 'favorites' | 'profile' | 'inquiries'

interface Address {
    id: string
    type: 'individual' | 'corporate'
    title: string
    city: string
    district: string
    full_address: string
    company_name?: string
    tax_office?: string
    tax_number?: string
}

interface OrderSummary {
    id: number
    order_number: string
    status: string
    payment_status: string
    total: number
    currency: string
    items: string
    created_at: string
}

export default function AccountPage() {
    const { lang } = useLanguage()
    const { member, isLoading, logout, updateProfile, token } = useMemberAuth()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const [activeTab, setActiveTab] = useState<Tab>(() => {
        const t = searchParams.get('tab') as Tab
        return ['orders', 'favorites', 'profile', 'inquiries'].includes(t) ? t : 'orders'
    })

    const [unreadInquiries, setUnreadInquiries] = useState(0)

    // Update URL when tab changes
    const handleTabChange = (key: Tab) => {
        setActiveTab(key)
        setSearchParams({ tab: key })
    }

    // Fetch unread count for badge
    const fetchUnreadCount = useCallback(() => {
        if (!token) return
        fetch(`${API_BASE}/api/member-auth/inquiries?site_id=${SITE_ID}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then((res: any) => {
                const count = res.data?.filter((inq: any) => inq.status === 'replied').length || 0
                setUnreadInquiries(count)
            })
            .catch(() => setUnreadInquiries(0))
    }, [token])

    useEffect(() => {
        fetchUnreadCount()
        // Polling every 5 seconds for live updates
        const interval = setInterval(fetchUnreadCount, 5000)
        return () => clearInterval(interval)
    }, [fetchUnreadCount])

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoading && !member) {
            navigate('/giris-yap')
        }
    }, [isLoading, member, navigate])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
            </div>
        )
    }

    if (!member) return null

    const tabs = [
        { key: 'orders' as Tab, label: t('account.tabOrders', lang), icon: ShoppingBag },
        { key: 'favorites' as Tab, label: t('account.tabFavorites', lang), icon: Heart },
        { key: 'inquiries' as Tab, label: t('account.tabInquiries', lang), icon: MessageSquare },
        { key: 'profile' as Tab, label: t('account.tabProfile', lang), icon: User },
    ]

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div className="mx-auto max-w-300 px-6 py-12 lg:px-10">
            {/* Account Header */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-lg">
                        {member.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="font-serif text-2xl font-medium text-slate-900">{t('account.title', lang)}</h1>
                        <p className="text-sm text-slate-500">{member.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('account.logout', lang)}</span>
                </button>
            </div>

            {/* Top Navigation Tabs */}
            <div className="mb-8 flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 flex-wrap">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.key
                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all min-w-30 ${isActive
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            {tab.key === 'inquiries' && unreadInquiries > 0 && (
                                <span className="absolute top-1 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce-slow">
                                    {unreadInquiries}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'orders' && <OrdersTab token={token} lang={lang} />}
            {activeTab === 'favorites' && <FavoritesTab member={member} lang={lang} />}
            {activeTab === 'inquiries' && <InquiriesTab token={token} lang={lang} onInquiryRead={() => {
                // Manually decrement or re-fetch badge count
                fetch(`${API_BASE}/api/member-auth/inquiries?site_id=${SITE_ID}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                })
                    .then(res => res.json())
                    .then((res: any) => {
                        const count = res.data?.filter((inq: any) => inq.status === 'replied').length || 0
                        setUnreadInquiries(count)
                    })
            }} />}
            {activeTab === 'profile' && <ProfileTab member={member} updateProfile={updateProfile} lang={lang} />}
        </div>
    )
}

// ─── Profile & Addresses Tab ───
function ProfileTab({ member, updateProfile, lang }: { member: MemberProfile; updateProfile: (data: any) => Promise<void>; lang: 'tr' | 'en' }) {
    const [fullName, setFullName] = useState(member.full_name)
    const [phone, setPhone] = useState(member.phone || '')
    const [companyName, setCompanyName] = useState(member.company_name || '')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Addresses
    const [addresses, setAddresses] = useState<Address[]>(() => {
        try {
            return member.addresses ? JSON.parse(member.addresses) : []
        } catch { return [] }
    })
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [newAddress, setNewAddress] = useState<Address>({
        id: '', type: 'individual', title: '', city: '', district: '', full_address: '',
    })
    const [editingAddrId, setEditingAddrId] = useState<string | null>(null)
    const [editDraft, setEditDraft] = useState<Address>({ id: '', type: 'individual', title: '', city: '', district: '', full_address: '' })
    const [addrSaving, setAddrSaving] = useState(false)

    // Persist addresses array to DB
    const saveAddresses = useCallback(async (addrs: Address[]) => {
        setAddrSaving(true)
        try {
            await updateProfile({ addresses: JSON.stringify(addrs) } as any)
            setAddresses(addrs)
        } catch (err) {
            console.error('Failed to save addresses:', err)
        } finally {
            setAddrSaving(false)
        }
    }, [updateProfile])

    const handleSaveProfile = async () => {
        setSaving(true)
        setSaved(false)
        try {
            await updateProfile({
                full_name: fullName,
                phone: phone || null,
                company_name: companyName || null,
                addresses: JSON.stringify(addresses),
            } as any)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleAddAddress = async () => {
        if (!newAddress.title || !newAddress.city || !newAddress.full_address) return
        const addr = { ...newAddress, id: crypto.randomUUID() }
        const updated = [...addresses, addr]
        setNewAddress({ id: '', type: 'individual', title: '', city: '', district: '', full_address: '' })
        setShowAddressForm(false)
        await saveAddresses(updated)
    }

    const handleRemoveAddress = async (id: string) => {
        await saveAddresses(addresses.filter((a) => a.id !== id))
    }

    const handleStartEdit = (addr: Address) => {
        setEditingAddrId(addr.id)
        setEditDraft({ ...addr })
        setShowAddressForm(false)
    }

    const handleSaveEdit = async () => {
        const updated = addresses.map(a => a.id === editingAddrId ? editDraft : a)
        await saveAddresses(updated)
        setEditingAddrId(null)
    }

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            {/* Profile Info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-6 font-serif text-lg font-medium text-slate-900">{t('account.profileTitle', lang)}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">{t('auth.fullName', lang)}</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">{t('auth.email', lang)}</label>
                        <input
                            type="email"
                            value={member.email}
                            disabled
                            className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">{t('auth.phone', lang)}</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">{t('auth.companyName', lang)}</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="mt-2 flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 disabled:opacity-60"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                        {saving ? t('account.saving', lang) : saved ? t('account.saved', lang) : t('account.saveChanges', lang)}
                    </button>
                </div>
            </div>

            {/* Addresses */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-serif text-lg font-medium text-slate-900">{t('account.addressesTitle', lang)}</h2>
                    <button
                        onClick={() => setShowAddressForm(true)}
                        className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-all hover:bg-brand-100"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        {t('account.addAddress', lang)}
                    </button>
                </div>

                {/* Existing addresses */}
                {addresses.length === 0 && !showAddressForm && (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <MapPin className="h-10 w-10 text-slate-200 mb-3" />
                        <p className="text-sm text-slate-400">Henüz kayıtlı adresiniz yok.</p>
                    </div>
                )}

                <div className="space-y-3">
                    {addresses.map((addr) => (
                        <div key={addr.id} className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                            {editingAddrId === addr.id ? (
                                /* ── Inline edit form ── */
                                <div className="p-4 space-y-3">
                                    <p className="text-xs font-bold text-slate-600 mb-1">{t('account.editAddress', lang)}</p>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={editDraft.type}
                                            onChange={e => setEditDraft({ ...editDraft, type: e.target.value as 'individual' | 'corporate' })}
                                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                                        >
                                            <option value="individual">{t('account.individual', lang)}</option>
                                            <option value="corporate">{t('account.corporate', lang)}</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder={t('account.addressTitle', lang)}
                                            value={editDraft.title}
                                            onChange={e => setEditDraft({ ...editDraft, title: e.target.value })}
                                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="text" placeholder={t('account.city', lang)} value={editDraft.city}
                                            onChange={e => setEditDraft({ ...editDraft, city: e.target.value })}
                                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400" />
                                        <input type="text" placeholder={t('account.district', lang)} value={editDraft.district}
                                            onChange={e => setEditDraft({ ...editDraft, district: e.target.value })}
                                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400" />
                                    </div>
                                    <textarea
                                        placeholder={t('account.fullAddress', lang)}
                                        value={editDraft.full_address}
                                        onChange={e => setEditDraft({ ...editDraft, full_address: e.target.value })}
                                        rows={2}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 resize-none"
                                    />
                                    {editDraft.type === 'corporate' && (
                                        <div className="grid grid-cols-3 gap-2">
                                            <input type="text" placeholder={t('auth.companyName', lang)} value={editDraft.company_name || ''}
                                                onChange={e => setEditDraft({ ...editDraft, company_name: e.target.value })}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400" />
                                            <input type="text" placeholder={t('account.taxOffice', lang)} value={editDraft.tax_office || ''}
                                                onChange={e => setEditDraft({ ...editDraft, tax_office: e.target.value })}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400" />
                                            <input type="text" placeholder={t('account.taxNumber', lang)} value={editDraft.tax_number || ''}
                                                onChange={e => setEditDraft({ ...editDraft, tax_number: e.target.value })}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400" />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={addrSaving || !editDraft.title || !editDraft.city || !editDraft.full_address}
                                            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-brand-700 disabled:opacity-50"
                                        >
                                            {addrSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                            {t('account.save', lang)}
                                        </button>
                                        <button
                                            onClick={() => setEditingAddrId(null)}
                                            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 transition-all"
                                        >
                                            {t('account.cancel', lang)}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ── Display view ── */
                                <div className="flex items-start justify-between p-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-slate-800">{addr.title}</span>
                                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${addr.type === 'corporate'
                                                ? 'bg-violet-100 text-violet-700 border border-violet-200'
                                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                }`}>
                                                {addr.type === 'corporate' ? t('account.corporate', lang) : t('account.individual', lang)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500">{addr.full_address}</p>
                                        <p className="text-xs text-slate-400">{addr.district}, {addr.city}</p>
                                        {addr.type === 'corporate' && addr.tax_number && (
                                            <p className="text-xs text-violet-500 mt-1 flex items-center gap-1">
                                                <Building2 className="h-3 w-3" />
                                                {addr.company_name} — VN: {addr.tax_number}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 ml-2 shrink-0">
                                        <button
                                            onClick={() => handleStartEdit(addr)}
                                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                            title="Düzenle"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveAddress(addr.id)}
                                            disabled={addrSaving}
                                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Sil"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Address Form */}
                {showAddressForm && (
                    <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50/30 p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <select
                                value={newAddress.type}
                                onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as 'individual' | 'corporate' })}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                            >
                                <option value="individual">{t('account.individual', lang)}</option>
                                <option value="corporate">{t('account.corporate', lang)}</option>
                            </select>
                            <input
                                type="text"
                                placeholder={t('account.addressTitle', lang)}
                                value={newAddress.title}
                                onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder={t('account.city', lang)}
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
                            />
                            <input
                                type="text"
                                placeholder={t('account.district', lang)}
                                value={newAddress.district}
                                onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
                            />
                        </div>
                        <textarea
                            placeholder={t('account.fullAddress', lang)}
                            value={newAddress.full_address}
                            onChange={(e) => setNewAddress({ ...newAddress, full_address: e.target.value })}
                            rows={2}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 resize-none"
                        />
                        {newAddress.type === 'corporate' && (
                            <div className="grid grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    placeholder={t('auth.companyName', lang)}
                                    value={newAddress.company_name || ''}
                                    onChange={(e) => setNewAddress({ ...newAddress, company_name: e.target.value })}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
                                />
                                <input
                                    type="text"
                                    placeholder={t('account.taxOffice', lang)}
                                    value={newAddress.tax_office || ''}
                                    onChange={(e) => setNewAddress({ ...newAddress, tax_office: e.target.value })}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
                                />
                                <input
                                    type="text"
                                    placeholder={t('account.taxNumber', lang)}
                                    value={newAddress.tax_number || ''}
                                    onChange={(e) => setNewAddress({ ...newAddress, tax_number: e.target.value })}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
                                />
                            </div>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                            <button
                                onClick={handleAddAddress}
                                className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-brand-700"
                            >
                                {t('account.save', lang)}
                            </button>
                            <button
                                onClick={() => setShowAddressForm(false)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-500 transition-all hover:bg-slate-50"
                            >
                                {t('account.cancel', lang)}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Shared order constants ───
const ORDER_FLOW_STEPS = [
    { key: 'pending', labelTr: 'Sipariş Alındı', labelEn: 'Order Received', icon: Clock },
    { key: 'processing', labelTr: 'Hazırlanıyor', labelEn: 'Processing', icon: Package },
    { key: 'shipped', labelTr: 'Kargoda', labelEn: 'Shipped', icon: ShoppingBag },
    { key: 'delivered', labelTr: 'Teslim Edildi', labelEn: 'Delivered', icon: Check },
] as const

const STATUS_CONFIG: Record<string, { tr: string; en: string; color: string; dot: string }> = {
    pending: { tr: 'Bekliyor', en: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
    processing: { tr: 'Hazırlanıyor', en: 'Processing', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    shipped: { tr: 'Kargoda', en: 'Shipped', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
    delivered: { tr: 'Teslim Edildi', en: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    cancelled: { tr: 'İptal Edildi', en: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-400' },
}

const PAYMENT_CONFIG: Record<string, { tr: string; en: string; color: string }> = {
    pending: { tr: 'Ödeme Bekliyor', en: 'Awaiting Payment', color: 'bg-amber-50 text-amber-600 border-amber-200' },
    paid: { tr: 'Ödendi', en: 'Paid', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    failed: { tr: 'Başarısız', en: 'Failed', color: 'bg-red-50 text-red-600 border-red-200' },
}

// ─── Orders Tab ───
function OrdersTab({ token, lang }: { token: string | null; lang: 'tr' | 'en' }) {
    const [orders, setOrders] = useState<OrderSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [cancelling, setCancelling] = useState(false)
    const [cancelError, setCancelError] = useState<string | null>(null)
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)

    const fetchOrders = useCallback(() => {
        if (!token) { setLoading(false); return }
        fetch(`${API_BASE}/api/member-auth/orders?site_id=${SITE_ID}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((res: any) => setOrders(res.data || []))
            .catch(() => setOrders([]))
            .finally(() => setLoading(false))
    }, [token])

    useEffect(() => { fetchOrders() }, [fetchOrders])

    const openOrderDetail = async (orderId: number) => {
        setDetailLoading(true)
        setSelectedOrder(null)
        setCancelError(null)
        setShowCancelConfirm(false)
        try {
            const res = await fetch(`${API_BASE}/api/member-auth/orders/${orderId}?site_id=${SITE_ID}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            })
            const data = await res.json()
            setSelectedOrder(data.data)
        } catch {
            setSelectedOrder(null)
        } finally {
            setDetailLoading(false)
        }
    }

    const handleCancel = async (orderId: number) => {
        setCancelling(true)
        setCancelError(null)
        try {
            const res = await fetch(`${API_BASE}/api/member-auth/orders/${orderId}/cancel?site_id=${SITE_ID}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'İptal işlemi başarısız.')
            setSelectedOrder(null)
            setShowCancelConfirm(false)
            fetchOrders()
        } catch (err: any) {
            setCancelError(err.message)
        } finally {
            setCancelling(false)
        }
    }

    const parseItems = (itemsJson: string) => {
        try { return JSON.parse(itemsJson) || [] } catch { return [] }
    }

    const formatPrice = (price: number, currency: string) =>
        new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', { style: 'currency', currency: currency || 'TRY' }).format(price)

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                        <ShoppingBag className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="font-serif text-lg font-medium text-slate-700 mb-2">{t('account.tabOrders', lang)}</h3>
                    <p className="text-sm text-slate-400 max-w-sm">{t('account.noOrders', lang)}</p>
                    <a href="/urunler" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700">
                        <Package className="h-4 w-4" />
                        {t('common.products', lang)}
                    </a>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* ─── Order Cards ─── */}
            <div className="space-y-4">
                {orders.map((order) => {
                    const items = parseItems(order.items)
                    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                    const pc = PAYMENT_CONFIG[order.payment_status] || PAYMENT_CONFIG.pending
                    const isCancelled = order.status === 'cancelled'
                    const stepIdx = ORDER_FLOW_STEPS.findIndex(s => s.key === order.status)
                    const currentStep = isCancelled ? -1 : stepIdx >= 0 ? stepIdx : 0

                    return (
                        <button
                            key={order.id}
                            onClick={() => openOrderDetail(order.id)}
                            className="w-full text-left bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all hover:shadow-lg hover:border-slate-300 group"
                        >
                            {/* Card top accent — reflects order status color */}
                            <div className={`h-0.5 w-full ${sc.dot}`} />

                            <div className="p-5">
                                {/* Row 1: Order number + badges */}
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${sc.dot} ${order.status === 'processing' || order.status === 'pending' ? 'animate-pulse' : ''}`} />
                                            <span className="font-mono text-sm font-bold text-slate-900">#{order.order_number}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1 ml-4">
                                            <Clock className="h-3 w-3" />
                                            {new Date(order.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${pc.color}`}>
                                            {pc[lang]}
                                        </span>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${sc.color}`}>
                                            {sc[lang]}
                                        </span>
                                    </div>
                                </div>

                                {/* Row 2: mini order flow (horizontal) */}
                                {!isCancelled && (
                                    <div className="flex items-center gap-0 mb-4 ml-0.5">
                                        {ORDER_FLOW_STEPS.map((step, idx) => {
                                            const done = idx < currentStep
                                            const active = idx === currentStep
                                            return (
                                                <div key={step.key} className="flex items-center">
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${done ? 'bg-emerald-500 text-white' :
                                                        active ? 'bg-brand-600 text-white ring-2 ring-brand-200' :
                                                            'bg-slate-100 text-slate-300'
                                                        }`}>
                                                        {done
                                                            ? <Check className="h-3 w-3" strokeWidth={3} />
                                                            : <step.icon className="h-2.5 w-2.5" />
                                                        }
                                                    </div>
                                                    {idx < ORDER_FLOW_STEPS.length - 1 && (
                                                        <div className={`h-0.5 w-8 mx-1 rounded-full ${done ? 'bg-emerald-300' : 'bg-slate-100'}`} />
                                                    )}
                                                </div>
                                            )
                                        })}
                                        <span className={`ml-2 text-xs font-medium ${currentStep >= 0 ? 'text-brand-600' : 'text-slate-400'}`}>
                                            {ORDER_FLOW_STEPS[currentStep]?.[lang === 'tr' ? 'labelTr' : 'labelEn']}
                                        </span>
                                    </div>
                                )}

                                {/* Row 3: Items list */}
                                <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1.5">
                                    {items.slice(0, 3).map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                <span className="text-[9px] font-bold text-slate-400">{idx + 1}</span>
                                            </div>
                                            <span className="text-sm text-slate-700 truncate flex-1">{item.title || item.product_name || `Ürün #${item.product_id}`}</span>
                                            <span className="text-xs text-slate-400 shrink-0">×{item.qty || item.quantity || 1}</span>
                                        </div>
                                    ))}
                                    {items.length > 3 && (
                                        <p className="text-xs text-slate-400 pt-0.5 pl-7">+{items.length - 3} {lang === 'tr' ? 'ürün daha' : 'more items'}</p>
                                    )}
                                </div>

                                {/* Row 4: Total + arrow */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-black text-slate-900">{formatPrice(order.total, order.currency)}</span>
                                    <div className="flex items-center gap-1 text-xs font-medium text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {lang === 'tr' ? 'Detaylar' : 'Details'}
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </div>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* ─── Order Detail Modal ─── */}
            {(selectedOrder || detailLoading) && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-end sm:items-center justify-center"
                    onClick={() => !detailLoading && setSelectedOrder(null)}
                >
                    <div
                        className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {detailLoading ? (
                            <div className="flex items-center justify-center py-24">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
                                    <p className="text-sm text-slate-400">{lang === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
                                </div>
                            </div>
                        ) : selectedOrder && (() => {
                            const sc = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.pending
                            const pc = PAYMENT_CONFIG[selectedOrder.payment_status] || PAYMENT_CONFIG.pending
                            const items = selectedOrder.parsed_items || parseItems(selectedOrder.items)
                            const canCancel = selectedOrder.status === 'pending'
                            const isPaid = selectedOrder.payment_status === 'paid'
                            const isCancelled = selectedOrder.status === 'cancelled'
                            const stepIdx = ORDER_FLOW_STEPS.findIndex(s => s.key === selectedOrder.status)
                            const currentStepIdx = isCancelled ? -1 : stepIdx >= 0 ? stepIdx : 0

                            return (
                                <>
                                    {/* ── Modal Header ── */}
                                    <div className="shrink-0 px-6 pt-6 pb-5 border-b border-slate-100">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                                                    {lang === 'tr' ? 'Sipariş Detayı' : 'Order Detail'}
                                                </p>
                                                <h2 className="font-mono text-xl font-black text-slate-900">
                                                    #{selectedOrder.order_number}
                                                </h2>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {new Date(selectedOrder.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
                                                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedOrder(null)}
                                                className="mt-1 p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {/* Status badges row */}
                                        <div className="flex items-center gap-2 mt-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${sc.color}`}>{sc[lang]}</span>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${pc.color}`}>{pc[lang]}</span>
                                        </div>
                                    </div>

                                    {/* ── Modal Body (scrollable) ── */}
                                    <div className="flex-1 overflow-y-auto">
                                        {/* Order Flow Timeline */}
                                        <div className="px-6 py-5 border-b border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                                {lang === 'tr' ? 'Sipariş Takibi' : 'Order Tracking'}
                                            </p>
                                            {isCancelled ? (
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                                                    <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                                        <X className="h-4 w-4 text-red-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-red-800">{lang === 'tr' ? 'Sipariş İptal Edildi' : 'Order Cancelled'}</p>
                                                        <p className="text-xs text-red-500">{lang === 'tr' ? 'Bu sipariş iptal edildi.' : 'This order has been cancelled.'}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start">
                                                    {ORDER_FLOW_STEPS.map((step, idx) => {
                                                        const done = idx < currentStepIdx
                                                        const active = idx === currentStepIdx
                                                        const StepIcon = step.icon
                                                        return (
                                                            <div key={step.key} className="flex-1 flex flex-col items-center">
                                                                {/* Connector line + dot row */}
                                                                <div className="flex items-center w-full">
                                                                    {/* Left line */}
                                                                    <div className={`flex-1 h-0.5 ${idx === 0 ? 'invisible' : done || active ? 'bg-brand-400' : 'bg-slate-200'}`} />
                                                                    {/* Circle */}
                                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${done ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200' :
                                                                        active ? 'bg-brand-600 text-white shadow-md shadow-brand-200 ring-4 ring-brand-100' :
                                                                            'bg-slate-100 text-slate-300 border-2 border-dashed border-slate-200'
                                                                        }`}>
                                                                        {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <StepIcon className="h-3.5 w-3.5" />}
                                                                    </div>
                                                                    {/* Right line */}
                                                                    <div className={`flex-1 h-0.5 ${idx === ORDER_FLOW_STEPS.length - 1 ? 'invisible' : done ? 'bg-brand-400' : 'bg-slate-200'}`} />
                                                                </div>
                                                                {/* Label */}
                                                                <div className="mt-2 text-center px-1">
                                                                    <p className={`text-[10px] font-semibold leading-tight ${done ? 'text-emerald-600' : active ? 'text-brand-700 font-bold' : 'text-slate-300'
                                                                        }`}>
                                                                        {lang === 'tr' ? step.labelTr : step.labelEn}
                                                                    </p>
                                                                    {active && (
                                                                        <span className="inline-block w-1 h-1 rounded-full bg-brand-500 animate-pulse mt-0.5" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Items */}
                                        <div className="px-6 py-5 border-b border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                                {lang === 'tr' ? 'Ürünler' : 'Items'} ({items.length})
                                            </p>
                                            <div className="space-y-2">
                                                {items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                                        {/* Product icon / thumbnail */}
                                                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                                            {item.image_url ? (
                                                                <img src={getImageUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package className="h-4 w-4 text-slate-300" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-slate-800 truncate">
                                                                {item.title || item.product_name || `Ürün #${item.product_id}`}
                                                            </p>
                                                            <p className="text-xs text-slate-400 mt-0.5">
                                                                {item.qty || item.quantity || 1} {lang === 'tr' ? 'adet' : 'pcs'}
                                                                {item.unit_price && ` × ${formatPrice(item.unit_price, selectedOrder.currency)}`}
                                                            </p>
                                                        </div>
                                                        {(item.total_price || (item.unit_price && (item.qty || item.quantity))) && (
                                                            <span className="text-sm font-bold text-slate-900 shrink-0">
                                                                {formatPrice(item.total_price || item.unit_price * (item.qty || item.quantity || 1), selectedOrder.currency)}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Pricing */}
                                        <div className="px-6 py-5 border-b border-slate-100">
                                            <div className="space-y-2">
                                                {selectedOrder.subtotal > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500">{lang === 'tr' ? 'Ara Toplam' : 'Subtotal'}</span>
                                                        <span className="font-medium text-slate-700">{formatPrice(selectedOrder.subtotal, selectedOrder.currency)}</span>
                                                    </div>
                                                )}
                                                {selectedOrder.tax > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500">{lang === 'tr' ? 'KDV' : 'Tax'}</span>
                                                        <span className="font-medium text-slate-700">{formatPrice(selectedOrder.tax, selectedOrder.currency)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                                    <span className="text-base font-bold text-slate-900">{lang === 'tr' ? 'Genel Toplam' : 'Total'}</span>
                                                    <span className="text-2xl font-black text-brand-600">{formatPrice(selectedOrder.total, selectedOrder.currency)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shipping address */}
                                        {selectedOrder.shipping_address && (
                                            <div className="px-6 py-5 border-b border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                                    {lang === 'tr' ? 'Teslimat Adresi' : 'Delivery Address'}
                                                </p>
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                    <p className="text-sm text-slate-600 leading-relaxed">{selectedOrder.shipping_address}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Invoice + Cancel — bottom actions */}
                                        <div className="px-6 py-5 space-y-3">
                                            {isPaid && (
                                                <a
                                                    href={`${API_BASE}/api/orders/${selectedOrder.id}/invoice`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-200 py-3 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-50 hover:border-indigo-300"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    {lang === 'tr' ? 'Faturayı Görüntüle / İndir' : 'View / Download Invoice'}
                                                </a>
                                            )}

                                            {canCancel && !showCancelConfirm && (
                                                <div className="space-y-1.5">
                                                    {cancelError && (
                                                        <div className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-600 border border-red-100">
                                                            {cancelError}
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => setShowCancelConfirm(true)}
                                                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-50 hover:border-red-300"
                                                    >
                                                        <X className="h-4 w-4" />
                                                        {lang === 'tr' ? 'Siparişi İptal Et' : 'Cancel Order'}
                                                    </button>
                                                    <p className="text-center text-[11px] text-slate-400">
                                                        {lang === 'tr' ? 'Yalnızca "Bekliyor" durumundaki siparişler iptal edilebilir.' : 'Only pending orders can be cancelled.'}
                                                    </p>
                                                </div>
                                            )}

                                            {canCancel && showCancelConfirm && (
                                                <div className="rounded-2xl border-2 border-red-200 bg-red-50/40 p-4 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-red-900">{lang === 'tr' ? 'Emin misiniz?' : 'Are you sure?'}</p>
                                                            <p className="text-xs text-red-600">{lang === 'tr' ? 'Bu işlem geri alınamaz.' : 'This action cannot be undone.'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setShowCancelConfirm(false)}
                                                            className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all"
                                                        >
                                                            {lang === 'tr' ? 'Vazgeç' : 'Go Back'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(selectedOrder.id)}
                                                            disabled={cancelling}
                                                            className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
                                                            {cancelling
                                                                ? (lang === 'tr' ? 'İptal ediliyor...' : 'Cancelling...')
                                                                : (lang === 'tr' ? 'Evet, İptal Et' : 'Yes, Cancel')
                                                            }
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )
                        })()}
                    </div>
                </div>
            )}
        </>
    )
}


// ─── Favorites Tab ───
function FavoritesTab({ member, lang }: { member: MemberProfile; lang: 'tr' | 'en' }) {
    const { toggleFavoriteProduct } = useMemberAuth()
    const { data: allProductsData } = useProducts()
    const allProducts = allProductsData?.data || []
    let favProducts: number[] = []
    let favArticles: number[] = []
    try {
        const rawProds = member.favorite_products ? JSON.parse(member.favorite_products) : []
        if (Array.isArray(rawProds)) {
            favProducts = rawProds
                .map((item: unknown) => typeof item === 'object' && item !== null && 'id' in item ? Number((item as Record<string, unknown>).id) : Number(item))
                .filter((id: number) => !isNaN(id))
        }
    } catch { /* */ }
    try { favArticles = member.favorite_articles ? JSON.parse(member.favorite_articles) : [] } catch { /* */ }

    const hasAnyFavorites = favProducts.length > 0 || favArticles.length > 0

    return (
        <div className="space-y-6">
            {!hasAnyFavorites ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                            <Heart className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="font-serif text-lg font-medium text-slate-700 mb-2">{t('account.tabFavorites', lang)}</h3>
                        <p className="text-sm text-slate-400 max-w-sm">{t('account.noFavorites', lang)}</p>
                        <a href="/urunler" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700">
                            <Package className="h-4 w-4" />
                            {t('common.products', lang)}
                        </a>
                    </div>
                </div>
            ) : (
                <>
                    {favProducts.length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-medium text-slate-900">
                                <Package className="h-5 w-5 text-brand-500" />
                                {t('account.favProducts', lang)}
                                <span className="ml-auto text-xs font-sans font-medium text-slate-400">{favProducts.length}</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {favProducts.map((pid) => {
                                    const p = allProducts?.find((x: any) => x.id === pid)
                                    const title = p ? localizedField(p, 'title', lang) : `Ürün #${pid}`

                                    return (
                                        <a key={pid} href={`/urunler/${p?.slug || pid}`} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-all hover:bg-white hover:border-slate-200 hover:shadow-sm">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 overflow-hidden text-brand-600 font-bold text-sm">
                                                {p?.image_url ? (
                                                    <img src={getImageUrl(p.image_url)} alt={title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="h-5 w-5 text-slate-300" />
                                                )}
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0 pr-2">
                                                <span className="text-sm font-semibold text-slate-700 truncate">{title}</span>
                                                {p?.price ? (
                                                    <span className="text-xs font-bold text-slate-900 mt-0.5">
                                                        {new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', { style: 'currency', currency: p.currency || 'TRY' }).format(p.price)}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 mt-0.5">{lang === 'tr' ? 'Fiyat Sorunuz' : 'Contact for Price'}</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    toggleFavoriteProduct(pid)
                                                }}
                                                className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                title={lang === 'tr' ? 'Favorilerden Çıkar' : 'Remove from Favorites'}
                                            >
                                                <Heart className="h-4 w-4 fill-current text-red-500" />
                                            </button>
                                        </a>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                    {favArticles.length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-medium text-slate-900">
                                <FileText className="h-5 w-5 text-emerald-500" />
                                {t('account.favArticles', lang)}
                                <span className="ml-auto text-xs font-sans font-medium text-slate-400">{favArticles.length}</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {favArticles.map((aid) => (
                                    <div key={aid} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 font-bold text-sm">#{aid}</div>
                                        <span className="text-sm font-medium text-slate-700">Makale #{aid}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

// ─── Inquiries Tab ───
function InquiriesTab({ token, lang, onInquiryRead }: { token: string | null; lang: 'tr' | 'en'; onInquiryRead?: () => void }) {
    const [inquiries, setInquiries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedInquiry, setSelectedInquiry] = useState<any>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight
            }
        }, 10)
    }

    useEffect(() => {
        if (selectedInquiry) {
            scrollToBottom()
        }
    }, [messages, selectedInquiry, loadingMessages])

    const fetchMessages = useCallback(async () => {
        if (!selectedInquiry || !token) return
        try {
            const res = await fetch(`${API_BASE}/api/member-auth/inquiries/${selectedInquiry.id}/messages?site_id=${SITE_ID}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            })
            const data = await res.json()
            setMessages(data.data || [])
        } catch (err) {
            console.error('Failed to fetch messages:', err)
        }
    }, [selectedInquiry, token])

    useEffect(() => {
        if (selectedInquiry) {
            const interval = setInterval(fetchMessages, 5000) // Poll chat every 5s
            return () => clearInterval(interval)
        }
    }, [fetchMessages, selectedInquiry])

    const fetchInquiries = useCallback(() => {
        if (!token) { setLoading(false); return }
        fetch(`${API_BASE}/api/member-auth/inquiries?site_id=${SITE_ID}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((res: any) => setInquiries(res.data || []))
            .catch(() => setInquiries([]))
            .finally(() => setLoading(false))
    }, [token])

    useEffect(() => { fetchInquiries() }, [fetchInquiries])

    const openInquiry = async (inquiry: any) => {
        setSelectedInquiry(inquiry)
        setLoadingMessages(true)
        setMessages([])

        // Mark as read if status is replied
        if (inquiry.status === 'replied') {
            fetch(`${API_BASE}/api/member-auth/inquiries/${inquiry.id}/read?site_id=${SITE_ID}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
            })
                .then(() => onInquiryRead?.())
                .catch(err => console.error('Failed to mark as read:', err))
        }

        try {
            const res = await fetch(`${API_BASE}/api/member-auth/inquiries/${inquiry.id}/messages?site_id=${SITE_ID}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            })
            const data = await res.json()
            setMessages(data.data || [])
        } catch {
            setMessages([])
        } finally {
            setLoadingMessages(false)
        }
    }

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!newMessage.trim() || sending || !selectedInquiry) return

        setSending(true)
        try {
            const res = await fetch(`${API_BASE}/api/member-auth/inquiries/${selectedInquiry.id}/messages?site_id=${SITE_ID}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage.trim() })
            })
            if (res.ok) {
                const data = await res.json()
                setMessages([...messages, data.data])
                setNewMessage('')
                fetchInquiries() // Refresh inquiry list to update timestamps/status if needed
            }
        } catch (err) {
            console.error('Failed to send message:', err)
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            </div>
        )
    }

    if (inquiries.length === 0) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                        <MessageSquare className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="font-serif text-lg font-medium text-slate-700 mb-2">{t('account.tabInquiries', lang)}</h3>
                    <p className="text-sm text-slate-400 max-w-sm">Henüz bir mesajlaşma bulunmuyor.</p>
                </div>
            </div>
        )
    }

    const getStatusColors = (status: string) => {
        switch (status) {
            case 'replied': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'read': return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'new': return 'bg-amber-50 text-amber-700 border-amber-200'
            default: return 'bg-slate-50 text-slate-600 border-slate-200'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'replied': return lang === 'tr' ? 'Yanıtlandı' : 'Replied'
            case 'read': return lang === 'tr' ? 'Okundu' : 'Read'
            case 'new': return lang === 'tr' ? 'Yeni' : 'New'
            default: return lang === 'tr' ? 'Arşivlendi' : 'Archived'
        }
    }

    return (
        <>
            <div className="space-y-4">
                {inquiries.map((inq) => {
                    const payload = inq.payload || {}
                    const subject = payload.subject || payload.inquiryType || 'Sistem Mesajı'
                    return (
                        <button
                            key={inq.id}
                            onClick={() => openInquiry(inq)}
                            className="w-full text-left bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all hover:shadow-lg hover:border-slate-300 p-5 group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <h3 className="text-base font-bold text-slate-900 truncate">{subject}</h3>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getStatusColors(inq.status)}`}>
                                        {getStatusLabel(inq.status)}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-1">
                                    {payload.message || 'Ek bilgi yok'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <span className="flex items-center gap-1.5 whitespace-nowrap">
                                    <Clock className="h-3.5 w-3.5" />
                                    {new Date(inq.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Chat Modal */}
            {selectedInquiry && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
                    onClick={() => setSelectedInquiry(null)}
                >
                    <div
                        className="bg-white w-full max-w-2xl shadow-2xl rounded-3xl h-[85vh] flex flex-col animate-zoom-in overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="shrink-0 px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                            <div>
                                <h2 className="font-serif text-lg font-bold text-slate-900 line-clamp-1">
                                    {selectedInquiry.payload?.subject || selectedInquiry.payload?.inquiryType || 'Destek Talebi'}
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">Talep #{selectedInquiry.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedInquiry(null)}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6 scrollbar-thin scroll-smooth">
                            {/* Original inquiry as first message */}
                            <div className="flex flex-col items-end">
                                <div className="max-w-[85%] bg-brand-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md">
                                    {Object.entries(selectedInquiry.payload || {}).map(([key, value]) => {
                                        if (key === 'inquiryType' || key === 'subject') return null
                                        return (
                                            <div key={key} className="mb-2 last:mb-0">
                                                <span className="block text-[10px] uppercase font-bold opacity-70 mb-0.5">{key}</span>
                                                <span className="text-sm whitespace-pre-wrap">{String(value)}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                                <span className="text-[10px] font-medium text-slate-400 mt-1.5 px-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(selectedInquiry.created_at).toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {loadingMessages ? (
                                <div className="flex justify-center py-10">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
                                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Yükleniyor...</span>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isUser = msg.sender === 'user'
                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${isUser
                                                ? 'bg-brand-600 text-white rounded-tr-sm'
                                                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                                                }`}>
                                                <p className="text-sm whitespace-pre-wrap font-medium">{msg.message}</p>
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-400 mt-1.5 px-1 flex items-center gap-1">
                                                {!isUser && <span className="font-bold text-slate-500 mr-1">For-Labs </span>}
                                                <Clock className="w-3 h-3" />
                                                {new Date(msg.created_at).toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Message Input Container */}
                        <div className="shrink-0 p-4 bg-white border-t border-slate-100">
                            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={lang === 'tr' ? 'Mesajınızı yazın...' : 'Type your message...'}
                                    className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 focus:bg-white transition-colors max-h-32 min-h-11"
                                    rows={Math.min(Math.max(newMessage.split('\n').length, 1), 5)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSendMessage()
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="w-11 h-11 shrink-0 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl flex items-center justify-center transition-colors"
                                >
                                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

