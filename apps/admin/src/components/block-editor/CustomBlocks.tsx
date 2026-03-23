import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import {
    GripVertical,
    Trash2,
    ArrowLeftRight,
    Plus,
    ChevronDown,
    ChevronRight,
    ImageIcon,
    Upload,
} from "lucide-react";
import { useState, useRef } from "react";
import { api } from "../../lib/api";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Shared Block Wrapper — consistent chrome for all blocks
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function BlockWrapper({
    label,
    color,
    selected,
    onDelete,
    children,
}: {
    label: string;
    color: string;
    selected: boolean;
    onDelete: () => void;
    children: React.ReactNode;
}) {
    return (
        <NodeViewWrapper className="my-4">
            <div
                className={`relative group rounded-2xl border-2 transition-all ${
                    selected
                        ? `border-${color}-300 shadow-lg shadow-${color}-100/50 ring-2 ring-${color}-200/40`
                        : `border-${color}-100 hover:border-${color}-200`
                } bg-white overflow-hidden`}
            >
                {/* Block header bar */}
                <div
                    className={`flex items-center justify-between px-3 py-1.5 bg-${color}-50/80 border-b border-${color}-100/60`}
                >
                    <div className="flex items-center gap-2">
                        <div
                            className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors"
                            data-drag-handle=""
                        >
                            <GripVertical size={14} />
                        </div>
                        <span
                            className={`text-[10px] font-bold uppercase tracking-wider text-${color}-500`}
                        >
                            {label}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        title="Bloğu sil"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
                {/* Block content */}
                <div className="p-4">{children}</div>
            </div>
        </NodeViewWrapper>
    );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. HERO SECTION BLOCK
   Big title + subtitle + CTA button
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function HeroNodeView({ node, updateAttributes, selected, deleteNode }: any) {
    const { title, subtitle, buttonText, buttonUrl, bgColor, textColor, alignment } =
        node.attrs;

    const presetBgs = [
        { color: "#0f172a", label: "Koyu" },
        { color: "#1e293b", label: "Slate" },
        { color: "#312e81", label: "Indigo" },
        { color: "#f8fafc", label: "Açık" },
        { color: "#eff6ff", label: "Mavi" },
        { color: "#f0fdf4", label: "Yeşil" },
    ];

    return (
        <BlockWrapper label="Hero Section" color="violet" selected={selected} onDelete={deleteNode}>
            {/* Preview area */}
            <div
                className="rounded-xl p-8 md:p-12 transition-all"
                style={{ backgroundColor: bgColor, textAlign: alignment }}
            >
                <input
                    type="text"
                    value={title}
                    onChange={(e) => updateAttributes({ title: e.target.value })}
                    className="w-full bg-transparent text-2xl md:text-3xl font-black tracking-tight outline-none placeholder:opacity-30 mb-3"
                    style={{ color: textColor }}
                    placeholder="Hero Başlık..."
                />
                <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => updateAttributes({ subtitle: e.target.value })}
                    className="w-full bg-transparent text-base md:text-lg font-medium outline-none placeholder:opacity-30 mb-6"
                    style={{ color: textColor, opacity: 0.75 }}
                    placeholder="Alt başlık metni..."
                />
                <div className="flex items-center gap-3 flex-wrap" style={{ justifyContent: alignment }}>
                    <input
                        type="text"
                        value={buttonText}
                        onChange={(e) => updateAttributes({ buttonText: e.target.value })}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white/20 border border-white/30 outline-none text-center min-w-30"
                        style={{ color: textColor }}
                        placeholder="Buton Metni"
                    />
                    <input
                        type="text"
                        value={buttonUrl}
                        onChange={(e) => updateAttributes({ buttonUrl: e.target.value })}
                        className="px-3 py-2 rounded-lg text-xs font-mono bg-black/5 border border-black/10 outline-none min-w-45"
                        style={{ color: textColor, opacity: 0.6 }}
                        placeholder="https://..."
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="mt-3 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Arka Plan:</span>
                    {presetBgs.map((p) => (
                        <button
                            key={p.color}
                            type="button"
                            onClick={() =>
                                updateAttributes({
                                    bgColor: p.color,
                                    textColor: ["#f8fafc", "#eff6ff", "#f0fdf4"].includes(p.color)
                                        ? "#0f172a"
                                        : "#ffffff",
                                })
                            }
                            className={`w-5 h-5 rounded-full border-2 transition-all ${
                                bgColor === p.color ? "border-indigo-400 scale-125" : "border-slate-200"
                            }`}
                            style={{ backgroundColor: p.color }}
                            title={p.label}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Hizalama:</span>
                    {(["left", "center"] as const).map((a) => (
                        <button
                            key={a}
                            type="button"
                            onClick={() => updateAttributes({ alignment: a })}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                alignment === a
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                            }`}
                        >
                            {a === "left" ? "Sol" : "Orta"}
                        </button>
                    ))}
                </div>
            </div>
        </BlockWrapper>
    );
}

export const HeroSection = Node.create({
    name: "heroSection",
    group: "block",
    atom: true,
    draggable: true,

    addAttributes() {
        return {
            title: { default: "" },
            subtitle: { default: "" },
            buttonText: { default: "Detaylı Bilgi" },
            buttonUrl: { default: "#" },
            bgColor: { default: "#0f172a" },
            textColor: { default: "#ffffff" },
            alignment: { default: "center" },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="hero-section"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["div", mergeAttributes({ "data-type": "hero-section" }, HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(HeroNodeView);
    },
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   2. TWO-COLUMN GRID BLOCK
   Image + Text side by side
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function GridNodeView({ node, updateAttributes, selected, deleteNode }: any) {
    const { imageUrl, imagePosition, text } = node.attrs;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        try {
            const res = await api.uploadMedia(file, "pages");
            updateAttributes({ imageUrl: res.data.url });
        } catch (err) {
            console.error("Image upload failed:", err);
        } finally {
            setUploading(false);
        }
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleImageUpload(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file?.type.startsWith("image/")) handleImageUpload(file);
    };

    const imageSide = (
        <div
            className={`flex items-center justify-center rounded-xl border-2 border-dashed transition-all min-h-50 ${
                imageUrl
                    ? "border-transparent"
                    : "border-slate-200 hover:border-indigo-300 bg-slate-50/50 cursor-pointer"
            }`}
            onClick={() => !imageUrl && fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileSelect}
                className="hidden"
            />
            {uploading ? (
                <div className="flex flex-col items-center gap-2 text-indigo-400">
                    <Upload size={24} className="animate-bounce" />
                    <span className="text-[10px] font-bold">Yükleniyor...</span>
                </div>
            ) : imageUrl ? (
                <div className="relative w-full group/img">
                    <img
                        src={imageUrl}
                        alt=""
                        className="w-full h-auto rounded-xl object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-all rounded-xl flex items-center justify-center">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                            className="opacity-0 group-hover/img:opacity-100 px-3 py-1.5 bg-white rounded-lg text-[10px] font-bold text-slate-700 shadow-lg transition-all"
                        >
                            Değiştir
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 text-slate-300">
                    <ImageIcon size={32} />
                    <span className="text-[10px] font-bold">Görsel Yükle veya Sürükle</span>
                </div>
            )}
        </div>
    );

    const textSide = (
        <div className="flex flex-col h-full">
            <textarea
                value={text}
                onChange={(e) => updateAttributes({ text: e.target.value })}
                className="flex-1 w-full min-h-50 p-4 rounded-xl border border-slate-100 bg-slate-50/30 text-sm text-slate-700 leading-relaxed outline-none focus:border-indigo-200 focus:ring-1 focus:ring-indigo-100 resize-none placeholder:text-slate-300"
                placeholder="İçerik metnini buraya yazın..."
            />
        </div>
    );

    return (
        <BlockWrapper label="İkili Kolon" color="sky" selected={selected} onDelete={deleteNode}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imagePosition === "left" ? (
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
            {/* Controls */}
            <div className="mt-3 flex items-center gap-2">
                <button
                    type="button"
                    onClick={() =>
                        updateAttributes({
                            imagePosition: imagePosition === "left" ? "right" : "left",
                        })
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-all"
                >
                    <ArrowLeftRight size={12} /> Tarafları Değiştir
                </button>
            </div>
        </BlockWrapper>
    );
}

export const TwoColumnGrid = Node.create({
    name: "twoColumnGrid",
    group: "block",
    atom: true,
    draggable: true,

    addAttributes() {
        return {
            imageUrl: { default: "" },
            imagePosition: { default: "left" },
            text: { default: "" },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="two-column-grid"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["div", mergeAttributes({ "data-type": "two-column-grid" }, HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(GridNodeView);
    },
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   3. ACCORDION (FAQ) BLOCK
   Expandable question/answer pairs
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface AccordionItem {
    id: string;
    question: string;
    answer: string;
}

function AccordionNodeView({ node, updateAttributes, selected, deleteNode }: any) {
    const items: AccordionItem[] = (() => {
        try {
            return JSON.parse(node.attrs.items || "[]");
        } catch {
            return [];
        }
    })();

    const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

    const update = (newItems: AccordionItem[]) => {
        updateAttributes({ items: JSON.stringify(newItems) });
    };

    const addItem = () => {
        const newItem: AccordionItem = {
            id: crypto.randomUUID(),
            question: "",
            answer: "",
        };
        update([...items, newItem]);
        setOpenId(newItem.id);
    };

    const removeItem = (id: string) => {
        update(items.filter((i) => i.id !== id));
        if (openId === id) setOpenId(null);
    };

    const updateItem = (id: string, field: "question" | "answer", value: string) => {
        update(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
    };

    return (
        <BlockWrapper
            label="Akordiyon (SSS)"
            color="amber"
            selected={selected}
            onDelete={deleteNode}
        >
            <div className="space-y-2">
                {items.map((item, idx) => (
                    <div
                        key={item.id}
                        className={`rounded-xl border transition-all ${
                            openId === item.id
                                ? "border-amber-200 bg-amber-50/30 shadow-sm"
                                : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                    >
                        {/* Question row */}
                        <div
                            className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                            onClick={() => setOpenId(openId === item.id ? null : item.id)}
                        >
                            {openId === item.id ? (
                                <ChevronDown size={14} className="text-amber-500 shrink-0" />
                            ) : (
                                <ChevronRight size={14} className="text-slate-300 shrink-0" />
                            )}
                            <span className="text-[10px] font-bold text-amber-500/60 shrink-0 w-5">
                                {idx + 1}.
                            </span>
                            <input
                                type="text"
                                value={item.question}
                                onChange={(e) => updateItem(item.id, "question", e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300"
                                placeholder="Soru başlığı..."
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeItem(item.id);
                                }}
                                className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                        {/* Answer */}
                        {openId === item.id && (
                            <div className="px-3 pb-3 pl-10">
                                <textarea
                                    value={item.answer}
                                    onChange={(e) => updateItem(item.id, "answer", e.target.value)}
                                    className="w-full min-h-20 p-3 rounded-lg border border-amber-100 bg-white text-xs text-slate-600 leading-relaxed outline-none focus:border-amber-300 resize-none placeholder:text-slate-300"
                                    placeholder="Cevap metnini yazın..."
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add item button */}
            <button
                type="button"
                onClick={addItem}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-amber-200 text-amber-500 text-[11px] font-bold hover:bg-amber-50 hover:border-amber-300 transition-all"
            >
                <Plus size={14} /> Yeni Soru Ekle
            </button>
        </BlockWrapper>
    );
}

export const AccordionBlock = Node.create({
    name: "accordionBlock",
    group: "block",
    atom: true,
    draggable: true,

    addAttributes() {
        return {
            items: {
                default: JSON.stringify([
                    { id: "1", question: "", answer: "" },
                ]),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="accordion-block"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["div", mergeAttributes({ "data-type": "accordion-block" }, HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(AccordionNodeView);
    },
});
