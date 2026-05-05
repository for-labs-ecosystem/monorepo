import { Link } from 'react-router-dom'
import { Wrench, Droplets, Leaf, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { useServices } from '@forlabs/core'
import type { Service } from '@forlabs/shared'

const ICONS = [Wrench, Droplets, Leaf, ShieldCheck]

export default function ServicesPage() {
    const { data, isLoading } = useServices()
    const services = (data?.data ?? []) as Service[]

    return (
        <div className="py-16 lg:py-24">
            <title>Hizmetler — GıdaTest</title>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                <div className="mb-14 max-w-2xl">
                    <div className="flex items-center gap-3 mb-5">
                        <span className="w-10 h-px bg-sage-400" />
                        <span className="label-eyebrow">Hizmet Portföyü</span>
                    </div>
                    <h1 className="heading-serif text-4xl lg:text-5xl mb-5">
                        Akredite analiz ve <span className="italic text-sage-600">uzman destek</span>
                    </h1>
                    <p className="text-stone-600 text-lg leading-relaxed">
                        Mikrobiyolojik, kimyasal ve fizikokimyasal analiz; kalibrasyon ve mevzuat danışmanlığı.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={`${i % 2 === 0 ? 'card-organic' : 'card-organic-alt'} h-48 animate-pulse bg-oat-100`} />
                        ))}
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center py-20 text-stone-500">Henüz hizmet kaydı bulunmuyor.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {services.map((s, i) => {
                            const Icon = ICONS[i % ICONS.length]
                            return (
                                <Link
                                    key={s.id}
                                    to={`/hizmetler/${s.slug}`}
                                    className={`group ${i % 2 === 0 ? 'card-organic' : 'card-organic-alt'} p-8 flex gap-6 items-start`}
                                >
                                    <div className="w-14 h-14 bg-gradient-to-br from-sage-100 to-sage-200 flex items-center justify-center shrink-0 group-hover:from-harvest-100 group-hover:to-harvest-200 transition-all duration-500"
                                         style={{ borderTopLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}>
                                        <Icon className="w-6 h-6 text-sage-700 group-hover:text-harvest-700 transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="heading-serif text-xl text-forest-900 mb-2 group-hover:text-sage-700 transition-colors">{s.title}</h3>
                                        {s.description && (
                                            <p className="text-stone-600 text-sm leading-relaxed line-clamp-2 mb-3">{s.description}</p>
                                        )}
                                        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-sage-700 group-hover:text-harvest-600 transition-colors">
                                            Detaylı Bilgi <ArrowUpRight className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
