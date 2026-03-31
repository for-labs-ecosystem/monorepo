import { useState, type CSSProperties, type ReactNode } from 'react'
import { getEcosystemConfig } from './config'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TipTap JSON → React Renderer
   Converts the TipTap editor JSON output into React components.
   Handles standard nodes (paragraph, heading, list, image, etc.)
   and custom blocks (heroSection, twoColumnGrid, accordionBlock).
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface TiptapNode {
    type: string
    attrs?: Record<string, unknown>
    content?: TiptapNode[]
    text?: string
    marks?: TiptapMark[]
}

interface TiptapMark {
    type: string
    attrs?: Record<string, unknown>
}

export function resolveMediaUrl(url: string | null | undefined): string {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/api/')) {
        const { apiUrl } = getEcosystemConfig()
        return apiUrl ? `${apiUrl}${url}` : url
    }
    return url
}

/* ─── Text renderer with marks ─── */
function renderText(node: TiptapNode, key: string): ReactNode {
    if (!node.text) return null
    let element: ReactNode = node.text

    if (node.marks) {
        for (const mark of node.marks) {
            switch (mark.type) {
                case 'bold':
                    element = <strong key={key}>{element}</strong>
                    break
                case 'italic':
                    element = <em key={key}>{element}</em>
                    break
                case 'underline':
                    element = <u key={key}>{element}</u>
                    break
                case 'strike':
                    element = <s key={key}>{element}</s>
                    break
                case 'code':
                    element = <code key={key} className="px-1.5 py-0.5 rounded bg-slate-100 text-sm font-mono text-slate-700">{element}</code>
                    break
                case 'link': {
                    const href = (mark.attrs?.href as string) || '#'
                    const target = (mark.attrs?.target as string) || '_blank'
                    element = <a key={key} href={href} target={target} rel="noopener noreferrer" className="text-[#0055FF] underline decoration-[#0055FF]/30 underline-offset-2 hover:decoration-[#0055FF]">{element}</a>
                    break
                }
            }
        }
    }
    return element
}

/* ─── Render children of a node ─── */
function renderChildren(nodes?: TiptapNode[], keyPrefix = '', ctx: RenderCtx = {}): ReactNode[] {
    if (!nodes) return []
    return nodes.map((child, i) => renderNode(child, `${keyPrefix}-${i}`, { ...ctx }))
}

/* ─── Check if a node is effectively empty (no text content) ─── */
function isEmptyNode(node: TiptapNode): boolean {
    if (node.text && node.text.trim().length > 0) return false
    if (node.type === 'hardBreak') return false
    if (node.type === 'image') return false
    if (node.type === 'horizontalRule') return false
    if (node.type === 'heroSection' || node.type === 'twoColumnGrid' || node.type === 'accordionBlock') return false
    if (!node.content || node.content.length === 0) return true
    return node.content.every(isEmptyNode)
}

interface RenderCtx {
    insideListItem?: boolean
}

/* ─── Main node renderer ─── */
function renderNode(node: TiptapNode, key: string, ctx: RenderCtx = {}): ReactNode {
    const { insideListItem = false } = ctx
    const textAlign = (node.attrs?.textAlign as string) || undefined
    const style: CSSProperties | undefined = textAlign ? { textAlign: textAlign as CSSProperties['textAlign'] } : undefined

    switch (node.type) {
        case 'doc':
            return (
                <div className="space-y-10">
                    {node.content?.map((child, i) => renderNode(child, `${key}-${i}`))}
                </div>
            )

        case 'text':
            return renderText(node, key)

        case 'paragraph': {
            if (isEmptyNode(node)) return null
            if (insideListItem) {
                return (
                    <div key={key} style={style}>
                        {renderChildren(node.content, key, ctx)}
                    </div>
                )
            }
            return (
                <p key={key} style={style} className="text-base leading-relaxed text-slate-700">
                    {renderChildren(node.content, key, ctx)}
                </p>
            )
        }

        case 'heading': {
            const level = (node.attrs?.level as number) || 2
            const cls = level === 1
                ? 'text-3xl sm:text-4xl font-bold tracking-tight text-slate-900'
                : level === 2
                    ? 'text-2xl sm:text-3xl font-bold tracking-tight text-slate-900'
                    : 'text-xl sm:text-2xl font-semibold tracking-tight text-slate-900'
            const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
            return (
                <Tag key={key} style={style} className={cls}>
                    {renderChildren(node.content, key, ctx)}
                </Tag>
            )
        }

        case 'bulletList':
            return (
                <ul key={key} className="pl-6 list-disc space-y-2 text-slate-700 marker:text-slate-400">
                    {renderChildren(node.content, key, ctx)}
                </ul>
            )

        case 'orderedList':
            return (
                <ol key={key} className="pl-6 list-decimal space-y-2 text-slate-700 marker:text-slate-500 marker:font-semibold">
                    {renderChildren(node.content, key, ctx)}
                </ol>
            )

        case 'listItem':
            return (
                <li key={key} className="text-base leading-relaxed pl-1">
                    {renderChildren(node.content, key, { insideListItem: true })}
                </li>
            )

        case 'blockquote':
            return (
                <blockquote key={key} className="border-l-4 border-slate-300 pl-5 italic text-slate-600">
                    {renderChildren(node.content, key, ctx)}
                </blockquote>
            )

        case 'horizontalRule':
            return <hr key={key} className="border-slate-200" />

        case 'image': {
            const src = resolveMediaUrl(node.attrs?.src as string)
            const alt = (node.attrs?.alt as string) || ''
            return (
                <figure key={key}>
                    <img src={src} alt={alt} className="w-full rounded-xl shadow-sm" loading="lazy" />
                </figure>
            )
        }

        case 'codeBlock':
            return (
                <pre key={key} className="overflow-x-auto rounded-xl bg-slate-900 p-5 text-sm leading-relaxed text-slate-200">
                    <code>{renderChildren(node.content, key, ctx)}</code>
                </pre>
            )

        case 'heroSection':
            return <HeroBlock key={key} attrs={node.attrs || {}} />

        case 'twoColumnGrid':
            return <TwoColumnBlock key={key} attrs={node.attrs || {}} />

        case 'accordionBlock':
            return <AccordionBlockRenderer key={key} attrs={node.attrs || {}} />

        case 'hardBreak':
            return <br key={key} />

        default:
            if (node.content) {
                return <div key={key}>{renderChildren(node.content, key, ctx)}</div>
            }
            return null
    }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Custom Block: Hero Section
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function HeroBlock({ attrs }: { attrs: Record<string, unknown> }) {
    const title = (attrs.title as string) || ''
    const subtitle = (attrs.subtitle as string) || ''
    const buttonText = (attrs.buttonText as string) || ''
    const rawUrl = (attrs.buttonUrl as string) || '#'
    const buttonUrl = rawUrl !== '#' && rawUrl && !rawUrl.startsWith('/') && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://') && !rawUrl.startsWith('mailto:') && !rawUrl.startsWith('tel:')
        ? `https://${rawUrl}`
        : rawUrl
    const bgColor = (attrs.bgColor as string) || '#0f172a'
    const textColor = (attrs.textColor as string) || '#ffffff'
    const alignment = (attrs.alignment as string) || 'center'

    return (
        <section
            className="rounded-2xl px-8 py-12 md:px-14 md:py-16"
            style={{ backgroundColor: bgColor, textAlign: alignment as CSSProperties['textAlign'] }}
        >
            {title && (
                <h2
                    className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3"
                    style={{ color: textColor }}
                >
                    {title}
                </h2>
            )}
            {subtitle && (
                <p
                    className="text-base md:text-lg font-medium mb-6"
                    style={{ color: textColor, opacity: 0.75 }}
                >
                    {subtitle}
                </p>
            )}
            {buttonText && (
                <a
                    href={buttonUrl}
                    className="inline-block rounded-xl px-6 py-3 text-sm font-bold transition-all hover:opacity-90"
                    style={{
                        backgroundColor: `${textColor}20`,
                        color: textColor,
                        border: `1px solid ${textColor}40`,
                    }}
                >
                    {buttonText}
                </a>
            )}
        </section>
    )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Custom Block: Two-Column Grid (Image + Text)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function TwoColumnBlock({ attrs }: { attrs: Record<string, unknown> }) {
    const imageUrl = resolveMediaUrl(attrs.imageUrl as string)
    const imagePosition = (attrs.imagePosition as string) || 'left'
    const text = (attrs.text as string) || ''

    const imageSide = imageUrl ? (
        <div className="overflow-hidden rounded-xl">
            <img src={imageUrl} alt="" className="w-full h-auto object-cover" loading="lazy" />
        </div>
    ) : null

    const textSide = (
        <div className="flex items-center">
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{text}</p>
        </div>
    )

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {imagePosition === 'left' ? (
                <>
                    {imageSide}
                    {textSide}
                </>
            ) : (
                <>
                    {textSide}
                    {imageSide}
                </>
            )}
        </div>
    )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Custom Block: Accordion (FAQ)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface AccordionItem {
    id: string
    question: string
    answer: string
}

function AccordionBlockRenderer({ attrs }: { attrs: Record<string, unknown> }) {
    const items: AccordionItem[] = (() => {
        try {
            const raw = attrs.items as string
            return JSON.parse(raw || '[]')
        } catch {
            return []
        }
    })()

    const [openId, setOpenId] = useState<string | null>(items[0]?.id || null)

    if (!items.length) return null

    return (
        <div className="space-y-3">
            {items.map((item) => {
                const isOpen = openId === item.id
                return (
                    <div
                        key={item.id}
                        className={`rounded-xl border transition-all ${isOpen ? 'border-slate-300 shadow-sm' : 'border-slate-200'}`}
                    >
                        <button
                            type="button"
                            onClick={() => setOpenId(isOpen ? null : item.id)}
                            className="flex w-full items-center justify-between px-5 py-4 text-left"
                        >
                            <span className="text-sm font-bold text-slate-800">{item.question}</span>
                            <svg
                                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {isOpen && (
                            <div className="border-t border-slate-100 px-5 py-4">
                                <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{item.answer}</p>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Public Component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface TiptapRendererProps {
    content: string
}

export function TiptapRenderer({ content }: TiptapRendererProps) {
    if (!content) return null

    let doc: TiptapNode
    try {
        doc = JSON.parse(content)
    } catch {
        // Fallback: if content is HTML string (legacy), render it directly
        return <div dangerouslySetInnerHTML={{ __html: content }} />
    }

    if (!doc || doc.type !== 'doc') {
        // Not a valid TipTap document — treat as HTML
        return <div dangerouslySetInnerHTML={{ __html: content }} />
    }

    return <>{renderNode(doc, 'root')}</>
}
