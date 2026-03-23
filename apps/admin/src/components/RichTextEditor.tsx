import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
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
    Undo,
    Redo,
    Code,
    Minus,
    RemoveFormatting,
} from "lucide-react";

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    minHeight?: string;
}

/* ─── Toolbar Button ─── */
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
            className={`p-1.5 rounded-md transition-all ${active
                ? "bg-indigo-100 text-indigo-700 shadow-sm"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="w-px h-5 bg-slate-200 mx-0.5" />;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder,
    minHeight = "180px",
}: RichTextEditorProps) {
    const isUpdatingFromProp = useRef(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: "text-indigo-600 underline" },
            }),
            Placeholder.configure({
                placeholder: placeholder || "İçerik yazın...",
                showOnlyWhenEditable: true,
            }),
        ],
        content: value || "",
        onUpdate: ({ editor: currentEditor }) => {
            if (!isUpdatingFromProp.current) {
                onChange(currentEditor.getHTML());
            }
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none focus:outline-none px-4 py-3",
                style: `min-height: ${minHeight}`,
            },
        },
    });

    // Sync external value changes (e.g. when loading data)
    useEffect(() => {
        if (!editor) return;
        const currentHTML = editor.getHTML();
        const newValue = value || "";

        // Tiptap might represent empty as <p></p>
        const normalizedCurrent = currentHTML === "<p></p>" ? "" : currentHTML;
        const normalizedNew = newValue === "<p></p>" ? "" : newValue;

        if (normalizedNew !== normalizedCurrent) {
            isUpdatingFromProp.current = true;
            editor.commands.setContent(newValue, { emitUpdate: false });
            isUpdatingFromProp.current = false;
        }
    }, [value, editor]);

    if (!editor) return null;

    const addLink = () => {
        const url = window.prompt("Link URL:");
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
                {/* Undo/Redo */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Geri Al"
                >
                    <Undo size={15} />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="İleri Al"
                >
                    <Redo size={15} />
                </ToolbarBtn>

                <Divider />

                {/* Headings */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive("heading", { level: 1 })}
                    title="Başlık 1"
                >
                    <Heading1 size={15} />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive("heading", { level: 2 })}
                    title="Başlık 2"
                >
                    <Heading2 size={15} />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive("heading", { level: 3 })}
                    title="Başlık 3"
                >
                    <Heading3 size={15} />
                </ToolbarBtn>

                <Divider />

                {/* Inline formatting */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                    title="Kalın"
                >
                    <Bold size={15} />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                    title="İtalik"
                >
                    <Italic size={15} />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive("underline")}
                    title="Altı Çizili"
                >
                    <UnderlineIcon size={15} />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive("strike")}
                    title="Üstü Çizili"
                >
                    <Strikethrough size={15} />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    active={editor.isActive("code")}
                    title="Kod"
                >
                    <Code size={15} />
                </ToolbarBtn>

                <Divider />

                {/* Lists */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                    title="Madde İşaretli Liste"
                >
                    <List size={15} />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                    title="Numaralı Liste"
                >
                    <ListOrdered size={15} />
                </ToolbarBtn>

                <Divider />

                {/* Alignment */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    active={editor.isActive({ textAlign: "left" })}
                    title="Sola Hizala"
                >
                    <AlignLeft size={15} />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    active={editor.isActive({ textAlign: "center" })}
                    title="Ortala"
                >
                    <AlignCenter size={15} />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    active={editor.isActive({ textAlign: "right" })}
                    title="Sağa Hizala"
                >
                    <AlignRight size={15} />
                </ToolbarBtn>

                <Divider />

                {/* Link */}
                <ToolbarBtn
                    onClick={addLink}
                    active={editor.isActive("link")}
                    title="Link Ekle"
                >
                    <LinkIcon size={15} />
                </ToolbarBtn>

                {/* Horizontal rule */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Yatay Çizgi"
                >
                    <Minus size={15} />
                </ToolbarBtn>

                {/* Clear formatting */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    title="Biçimlendirmeyi Temizle"
                >
                    <RemoveFormatting size={15} />
                </ToolbarBtn>
            </div>

            {/* ── Editor Content ── */}
            <EditorContent editor={editor} />
        </div>
    );
}
