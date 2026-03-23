import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { api } from "../../lib/api";
import { HeroSection, TwoColumnGrid, AccordionBlock } from "./CustomBlocks";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Unlink,
    Code,
    Quote,
    Minus,
    ImageIcon,
    Plus,
    Columns2,
    MessageSquareQuote,
    Sparkles,
    Type,
    Upload,
    Undo,
    Redo,
} from "lucide-react";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Block Editor — Modern block-based page builder
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface BlockEditorProps {
    value: string;
    onChange: (json: string) => void;
    placeholder?: string;
}

/* ─── Block menu items for the "+" floating button ─── */
const BLOCK_ITEMS = [
    { id: "paragraph", label: "Paragraf", icon: Type, color: "text-slate-500", description: "Normal metin paragrafı" },
    { id: "heading2", label: "Başlık", icon: Heading2, color: "text-slate-600", description: "Orta boy başlık" },
    { id: "bulletList", label: "Liste", icon: List, color: "text-slate-500", description: "Madde işaretli liste" },
    { id: "orderedList", label: "Numaralı Liste", icon: ListOrdered, color: "text-slate-500", description: "Sıralı liste" },
    { id: "blockquote", label: "Alıntı", icon: Quote, color: "text-emerald-500", description: "Vurgulu alıntı bloğu" },
    { id: "image", label: "Görsel", icon: ImageIcon, color: "text-sky-500", description: "R2'ye yükle veya sürükle" },
    { id: "horizontalRule", label: "Ayırıcı", icon: Minus, color: "text-slate-400", description: "Yatay çizgi" },
    { id: "heroSection", label: "Hero Section", icon: Sparkles, color: "text-violet-500", description: "Büyük başlık + alt başlık + buton" },
    { id: "twoColumnGrid", label: "İkili Kolon", icon: Columns2, color: "text-sky-500", description: "Resim + metin yan yana" },
    { id: "accordionBlock", label: "Akordiyon (SSS)", icon: MessageSquareQuote, color: "text-amber-500", description: "Genişleyebilen soru-cevap" },
];

export default function BlockEditor({ value, onChange, placeholder }: BlockEditorProps) {
    const isUpdatingFromProp = useRef(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const editorWrapperRef = useRef<HTMLDivElement>(null);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [addBtnRect, setAddBtnRect] = useState<{ top: number; left: number } | null>(null);
    const addBtnRef = useRef<HTMLButtonElement>(null);
    const [uploading, setUploading] = useState(false);

    // Parse initial content once: try JSON first, fallback to HTML
    const [initialContent] = useState(() => {
        if (!value) return undefined;
        try {
            const parsed = JSON.parse(value);
            if (parsed && typeof parsed === "object") return parsed;
        } catch {
            // Not JSON — treat as HTML string
        }
        return value;
    });

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                dropcursor: { color: "#818cf8", width: 3 },
            }),
            Underline,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: "text-indigo-600 underline decoration-indigo-300 underline-offset-2" },
            }),
            Image.configure({
                HTMLAttributes: { class: "rounded-xl shadow-sm max-w-full mx-auto" },
                allowBase64: false,
            }),
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === "heading") return "Başlık...";
                    return placeholder || "Yazmaya başlayın veya blok eklemek için + butonuna tıklayın...";
                },
                showOnlyWhenEditable: true,
                includeChildren: true,
            }),
            HeroSection,
            TwoColumnGrid,
            AccordionBlock,
        ],
        content: initialContent,
        onUpdate: ({ editor: e }) => {
            if (!isUpdatingFromProp.current) {
                onChange(JSON.stringify(e.getJSON()));
            }
        },
        editorProps: {
            attributes: {
                class: "prose prose-slate prose-sm sm:prose-base max-w-none focus:outline-none px-8 py-5 min-h-100",
            },
            handleDrop: (_view, event, _slice, moved) => {
                if (moved || !event.dataTransfer?.files?.length) return false;
                const file = event.dataTransfer.files[0];
                if (!file?.type.startsWith("image/")) return false;
                event.preventDefault();
                handleImageUpload(file);
                return true;
            },
            handlePaste: (_view, event) => {
                const files = event.clipboardData?.files;
                if (!files?.length) return false;
                const file = files[0];
                if (!file?.type.startsWith("image/")) return false;
                event.preventDefault();
                handleImageUpload(file);
                return true;
            },
        },
    });

    // Track cursor position to show the "+" button on empty paragraphs
    useEffect(() => {
        if (!editor) return;

        const updateAddBtn = () => {
            const { $from } = editor.state.selection;
            const node = $from.parent;
            const isEmpty = node.type.name === "paragraph" && node.content.size === 0;

            if (isEmpty && editorWrapperRef.current) {
                try {
                    const pos = $from.before();
                    const dom = editor.view.nodeDOM(pos) as HTMLElement | null;
                    if (dom) {
                        const wrapperRect = editorWrapperRef.current.getBoundingClientRect();
                        const domRect = dom.getBoundingClientRect();
                        setAddBtnRect({
                            top: domRect.top - wrapperRect.top,
                            left: wrapperRect.left,
                        });
                        return;
                    }
                } catch {
                    // positioning failed, hide
                }
            }
            setAddBtnRect(null);
            setShowAddMenu(false);
        };

        editor.on("selectionUpdate", updateAddBtn);
        editor.on("transaction", updateAddBtn);
        return () => {
            editor.off("selectionUpdate", updateAddBtn);
            editor.off("transaction", updateAddBtn);
        };
    }, [editor]);

    // Sync external value changes (loading existing data)
    useEffect(() => {
        if (!editor || !value) return;
        try {
            const parsed = JSON.parse(value);
            const currentJSON = JSON.stringify(editor.getJSON());
            if (JSON.stringify(parsed) !== currentJSON) {
                isUpdatingFromProp.current = true;
                editor.commands.setContent(parsed, { emitUpdate: false });
                isUpdatingFromProp.current = false;
            }
        } catch {
            const currentHTML = editor.getHTML();
            if (value !== currentHTML) {
                isUpdatingFromProp.current = true;
                editor.commands.setContent(value, { emitUpdate: false });
                isUpdatingFromProp.current = false;
            }
        }
    }, [value, editor]);

    const handleImageUpload = useCallback(
        async (file: File) => {
            if (!editor) return;
            setUploading(true);
            try {
                const res = await api.uploadMedia(file, "pages");
                editor.chain().focus().setImage({ src: res.data.url, alt: file.name }).run();
            } catch (err) {
                console.error("Image upload failed:", err);
            } finally {
                setUploading(false);
            }
        },
        [editor]
    );

    const insertBlock = useCallback(
        (blockId: string) => {
            if (!editor) return;
            setShowAddMenu(false);

            const cmds = editor.chain().focus();
            switch (blockId) {
                case "paragraph": cmds.setParagraph().run(); break;
                case "heading2": cmds.toggleHeading({ level: 2 }).run(); break;
                case "bulletList": cmds.toggleBulletList().run(); break;
                case "orderedList": cmds.toggleOrderedList().run(); break;
                case "blockquote": cmds.toggleBlockquote().run(); break;
                case "horizontalRule": cmds.setHorizontalRule().run(); break;
                case "image": imageInputRef.current?.click(); break;
                case "heroSection": cmds.insertContent({ type: "heroSection" }).run(); break;
                case "twoColumnGrid": cmds.insertContent({ type: "twoColumnGrid" }).run(); break;
                case "accordionBlock": cmds.insertContent({ type: "accordionBlock" }).run(); break;
            }
        },
        [editor]
    );

    const addLink = useCallback(() => {
        if (!editor) return;
        const prev = editor.getAttributes("link").href;
        const url = window.prompt("Link URL:", prev || "https://");
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().unsetLink().run();
        } else {
            editor.chain().focus().setLink({ href: url }).run();
        }
    }, [editor]);

    if (!editor) return null;

    return (
        <div ref={editorWrapperRef} className="relative border border-slate-200 rounded-2xl bg-white focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100/50 transition-all shadow-sm overflow-visible">
            {/* Hidden file input for image upload */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = "";
                }}
            />

            {/* ─── Fixed Toolbar ─── */}
            <div className="sticky top-0 z-30 flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-white/95 backdrop-blur-sm border-b border-slate-100">
                <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Geri Al">
                    <Undo size={15} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="İleri Al">
                    <Redo size={15} />
                </ToolbarBtn>
                <ToolbarDivider />
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="H1">
                    <Heading1 size={15} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2">
                    <Heading2 size={15} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3">
                    <Heading3 size={15} />
                </ToolbarBtn>
                <ToolbarDivider />
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Kalın">
                    <Bold size={15} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="İtalik">
                    <Italic size={15} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Altı Çizili">
                    <UnderlineIcon size={15} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Üstü Çizili">
                    <Strikethrough size={15} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Kod">
                    <Code size={15} />
                </ToolbarBtn>
                <ToolbarDivider />
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Liste">
                    <List size={15} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numaralı">
                    <ListOrdered size={15} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Alıntı">
                    <Quote size={15} />
                </ToolbarBtn>
                <ToolbarDivider />
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Sol">
                    <AlignLeft size={15} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Orta">
                    <AlignCenter size={15} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Sağ">
                    <AlignRight size={15} />
                </ToolbarBtn>
                <ToolbarDivider />
                <ToolbarBtn onClick={addLink} active={editor.isActive("link")} title="Link">
                    {editor.isActive("link") ? <Unlink size={15} /> : <LinkIcon size={15} />}
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Ayırıcı">
                    <Minus size={15} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => imageInputRef.current?.click()} title="Görsel Ekle">
                    <ImageIcon size={15} />
                </ToolbarBtn>
            </div>

            {/* ─── Floating "+" Button on empty paragraphs ─── */}
            {addBtnRect !== null && (
                <div
                    className="absolute z-20 transition-all duration-100"
                    style={{ top: addBtnRect.top, left: 4 }}
                >
                    <button
                        ref={addBtnRef}
                        type="button"
                        onClick={() => setShowAddMenu((v) => !v)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            showAddMenu
                                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200/50 rotate-45"
                                : "bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-500"
                        }`}
                    >
                        <Plus size={16} strokeWidth={2.5} />
                    </button>
                </div>
            )}

            {/* ─── Block Picker Portal (renders at body to escape overflow clipping) ─── */}
            {showAddMenu && addBtnRect !== null && addBtnRef.current && createPortal(
                <>
                    {/* Backdrop to close on outside click */}
                    <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setShowAddMenu(false)}
                    />
                    <div
                        className="fixed z-[9999] w-64 bg-white rounded-xl border border-slate-200 shadow-2xl shadow-slate-200/60 py-2 max-h-80 overflow-y-auto"
                        style={{
                            top: addBtnRef.current.getBoundingClientRect().top,
                            left: addBtnRef.current.getBoundingClientRect().right + 8,
                        }}
                    >
                        <div className="px-3 pb-2 border-b border-slate-100 mb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Blok Ekle
                            </span>
                        </div>
                        {BLOCK_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => insertBlock(item.id)}
                                    className="w-full flex items-start gap-3 px-3 py-2 hover:bg-indigo-50/50 transition-colors text-left"
                                >
                                    <div className={`mt-0.5 ${item.color}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[12px] font-bold text-slate-700">{item.label}</div>
                                        <div className="text-[10px] text-slate-400 leading-tight">{item.description}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </>,
                document.body
            )}

            {/* ─── Upload overlay ─── */}
            {uploading && (
                <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-indigo-500">
                        <Upload size={28} className="animate-bounce" />
                        <span className="text-xs font-bold">Görsel yükleniyor...</span>
                    </div>
                </div>
            )}

            {/* ─── Editor Content Area (resizable) ─── */}
            <div
                className="overflow-auto resize-y"
                style={{ minHeight: 400, maxHeight: 900 }}
            >
                <EditorContent editor={editor} />
            </div>

            {/* ─── Bottom bar: block count + quick add custom blocks ─── */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/50">
                <span className="text-[10px] text-slate-400">
                    {editor.getJSON().content?.length ?? 0} blok
                </span>
                <div className="flex items-center gap-1">
                    {BLOCK_ITEMS.slice(7).map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => insertBlock(item.id)}
                                title={item.label}
                                className={`p-1.5 rounded-lg transition-all ${item.color} hover:bg-white hover:shadow-sm`}
                            >
                                <Icon size={14} />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ─── Toolbar button ─── */
function ToolbarBtn({
    onClick,
    active,
    disabled,
    title,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-1.5 rounded-md transition-all ${
                active
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
        >
            {children}
        </button>
    );
}

function ToolbarDivider() {
    return <div className="w-px h-5 bg-slate-200 mx-0.5" />;
}
