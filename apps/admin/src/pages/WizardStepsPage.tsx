import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "../lib/api";
import type {
    WizardStepWithOptions,
    WizardOption,
    WizardStepPayload,
    WizardOptionPayload,
} from "@forlabs/shared";
import {
    Wand2,
    Plus,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronRight,
    GripVertical,
    X,
    Tag,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
} from "lucide-react";

// ─── TagsManager (inline, chip-based) ────────────────────────────────────────

function TagsManager({
    value,
    onChange,
    placeholder = "Eklemek için Enter...",
}: {
    value: string[];
    onChange: (val: string[]) => void;
    placeholder?: string;
}) {
    const [input, setInput] = useState("");

    const addTag = () => {
        const tag = input.trim();
        if (tag && !value.includes(tag)) {
            onChange([...value, tag]);
            setInput("");
        }
    };

    const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-700 text-[11px] font-bold rounded-md border border-violet-100"
                    >
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-rose-600">
                            <X size={10} />
                        </button>
                    </span>
                ))}
            </div>
            <div className="relative">
                <input
                    type="text"
                    className="w-full h-8 text-xs border border-slate-200 rounded-lg px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    placeholder={placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                        }
                    }}
                />
                <button
                    onClick={addTag}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-indigo-600"
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>
    );
}

// ─── Step Form Modal (Interactive Sentence Builder) ──────────────────────────

const SLOT_TOKEN = "____";

interface StepFormData {
    field_key: string;
    title: string;
    title_en: string;
    prefix: string;
    prefix_en: string;
    suffix: string;
    suffix_en: string;
    is_active: boolean;
}

function buildSentence(prefix: string, suffix: string): string {
    const p = prefix.trim();
    const s = suffix.trim();
    if (!p && !s) return "";
    if (!p) return `${SLOT_TOKEN} ${s}`;
    if (!s) return `${p} ${SLOT_TOKEN}`;
    return `${p} ${SLOT_TOKEN} ${s}`;
}

function splitSentence(sentence: string): { prefix: string; suffix: string } {
    const idx = sentence.indexOf(SLOT_TOKEN);
    if (idx === -1) return { prefix: sentence.trim(), suffix: "" };
    return {
        prefix: sentence.substring(0, idx).trim(),
        suffix: sentence.substring(idx + SLOT_TOKEN.length).trim(),
    };
}

function SentenceInput({
    label,
    sentence,
    onChange,
    placeholder,
}: {
    label: string;
    sentence: string;
    onChange: (val: string) => void;
    placeholder: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const hasSlot = sentence.includes(SLOT_TOKEN);

    const insertSlot = () => {
        const el = inputRef.current;
        if (!el) return;
        if (hasSlot) return;
        const pos = el.selectionStart ?? sentence.length;
        const before = sentence.substring(0, pos);
        const after = sentence.substring(pos);
        const needSpaceBefore = before.length > 0 && !before.endsWith(" ");
        const needSpaceAfter = after.length > 0 && !after.startsWith(" ");
        const newVal = `${before}${needSpaceBefore ? " " : ""}${SLOT_TOKEN}${needSpaceAfter ? " " : ""}${after}`;
        onChange(newVal);
        setTimeout(() => {
            el.focus();
            const newPos = (before.length + (needSpaceBefore ? 1 : 0) + SLOT_TOKEN.length + (needSpaceAfter ? 1 : 0));
            el.setSelectionRange(newPos, newPos);
        }, 0);
    };

    const removeSlot = () => {
        onChange(sentence.replace(SLOT_TOKEN, "").replace(/  +/g, " ").trim());
    };

    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 block">{label}</label>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    className={`w-full h-10 text-sm border rounded-lg px-3 pr-24 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 ${
                        hasSlot ? "border-indigo-300 bg-indigo-50/30" : "border-slate-200"
                    }`}
                    placeholder={placeholder}
                    value={sentence}
                    onChange={(e) => onChange(e.target.value)}
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {hasSlot ? (
                        <button
                            type="button"
                            onClick={removeSlot}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                            title="Boşluğu kaldır"
                        >
                            <X size={10} />
                            Boşluk
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={insertSlot}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                            title="İmleç konumuna dropdown boşluğu ekle"
                        >
                            <Plus size={10} />
                            Boşluk Ekle
                        </button>
                    )}
                </div>
            </div>
            {!hasSlot && sentence.length > 0 && (
                <p className="text-[10px] text-amber-600 flex items-center gap-1">
                    <AlertCircle size={10} />
                    Cümlede dropdown boşluğu yok. İmleci istediğiniz yere koyup "Boşluk Ekle" butonuna tıklayın.
                </p>
            )}
        </div>
    );
}

function SentencePreview({ sentence, lang }: { sentence: string; lang: "TR" | "EN" }) {
    if (!sentence) return null;
    const parts = sentence.split(SLOT_TOKEN);
    if (parts.length < 2) {
        return (
            <span className="text-slate-600">{sentence}</span>
        );
    }
    return (
        <span>
            <span className="text-slate-600">{parts[0]}</span>
            <span className="inline-flex items-center gap-1 mx-0.5 px-3 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-200 border-dashed">
                <ChevronDown size={11} />
                {lang === "TR" ? "seçiniz..." : "select..."}
            </span>
            <span className="text-slate-600">{parts[1]}</span>
        </span>
    );
}

function StepFormModal({
    initial,
    onSave,
    onClose,
    saving,
}: {
    initial?: StepFormData;
    onSave: (data: StepFormData) => void;
    onClose: () => void;
    saving: boolean;
}) {
    const defaultForm: StepFormData = initial ?? {
        field_key: "",
        title: "",
        title_en: "",
        prefix: "",
        prefix_en: "",
        suffix: "",
        suffix_en: "",
        is_active: true,
    };

    const [fieldKey, setFieldKey] = useState(defaultForm.field_key);
    const [title, setTitle] = useState(defaultForm.title);
    const [titleEn, setTitleEn] = useState(defaultForm.title_en);
    const [sentenceTr, setSentenceTr] = useState(buildSentence(defaultForm.prefix, defaultForm.suffix));
    const [sentenceEn, setSentenceEn] = useState(buildSentence(defaultForm.prefix_en, defaultForm.suffix_en));
    const [isActive, setIsActive] = useState(defaultForm.is_active);

    const trParts = splitSentence(sentenceTr);
    const enParts = splitSentence(sentenceEn);
    const hasTrSlot = sentenceTr.includes(SLOT_TOKEN);
    const hasEnSlot = sentenceEn.includes(SLOT_TOKEN);
    const isValid = fieldKey.trim().length > 0 && hasTrSlot;

    const handleSave = () => {
        onSave({
            field_key: fieldKey,
            title,
            title_en: titleEn,
            prefix: trParts.prefix,
            prefix_en: enParts.prefix,
            suffix: trParts.suffix,
            suffix_en: enParts.suffix,
            is_active: isActive,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[92vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                            <Wand2 size={16} className="text-indigo-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-800">
                            {initial ? "Adımı Düzenle" : "Yeni Adım Oluştur"}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Meta row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Field Key</label>
                            <input
                                type="text"
                                className="w-full h-9 text-sm border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-mono"
                                placeholder="sectors"
                                value={fieldKey}
                                onChange={(e) => setFieldKey(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Başlık (TR)</label>
                            <input
                                type="text"
                                className="w-full h-9 text-sm border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                placeholder="Sektör"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Title (EN)</label>
                            <input
                                type="text"
                                className="w-full h-9 text-sm border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                placeholder="Sector"
                                value={titleEn}
                                onChange={(e) => setTitleEn(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Wand2 size={13} className="text-indigo-500" />
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Cümle Oluşturucu</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-4">
                            Websitede görünecek cümleyi yazın ve dropdown&apos;un olacağı yere imleci koyup <strong>&quot;Boşluk Ekle&quot;</strong> butonuna tıklayın.
                        </p>
                    </div>

                    {/* Turkish sentence builder */}
                    <SentenceInput
                        label="🇹🇷 Türkçe Cümle"
                        sentence={sentenceTr}
                        onChange={setSentenceTr}
                        placeholder="Merhaba, biz ____ sektöründe faaliyet gösteren bir ekibiz."
                    />

                    {/* English sentence builder */}
                    <SentenceInput
                        label="🇬🇧 English Sentence"
                        sentence={sentenceEn}
                        onChange={setSentenceEn}
                        placeholder="Hello, we are a team operating in the ____ sector."
                    />

                    {/* Live Preview */}
                    {(hasTrSlot || hasEnSlot) && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <Eye size={10} className="inline mr-1 -mt-0.5" />
                                    Canlı Ön İzleme
                                </span>
                            </div>
                            <div className="p-5 space-y-3">
                                {hasTrSlot && (
                                    <p className="text-lg font-serif leading-relaxed tracking-tight text-slate-800">
                                        <SentencePreview sentence={sentenceTr} lang="TR" />
                                    </p>
                                )}
                                {hasEnSlot && (
                                    <p className="text-base font-serif leading-relaxed tracking-tight text-slate-500 italic">
                                        <SentencePreview sentence={sentenceEn} lang="EN" />
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Active toggle */}
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs text-slate-600">Aktif</span>
                    </label>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                    <div className="text-[10px] text-slate-400">
                        {isValid ? (
                            <span className="text-emerald-600 font-semibold">✓ Kaydetmeye hazır</span>
                        ) : (
                            <span className="text-amber-600">Field key ve Türkçe cümledeki boşluk zorunludur</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                            İptal
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !isValid}
                            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                        >
                            {saving && <Loader2 size={12} className="animate-spin" />}
                            Kaydet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Option Form Modal ───────────────────────────────────────────────────────

interface OptionFormData {
    label: string;
    label_en: string;
    value: string;
    description: string;
    description_en: string;
    match_tags: string[];
    sort_order: number;
    is_active: boolean;
}

function OptionFormModal({
    initial,
    onSave,
    onClose,
    saving,
}: {
    initial?: OptionFormData;
    onSave: (data: OptionFormData) => void;
    onClose: () => void;
    saving: boolean;
}) {
    const [form, setForm] = useState<OptionFormData>(
        initial ?? {
            label: "",
            label_en: "",
            value: "",
            description: "",
            description_en: "",
            match_tags: [],
            sort_order: 0,
            is_active: true,
        }
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800">
                        {initial ? "Seçeneği Düzenle" : "Yeni Seçenek"}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Etiket (TR)</label>
                            <input
                                type="text"
                                className="w-full h-9 text-sm border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                placeholder="Gıda ve İçecek"
                                value={form.label}
                                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Label (EN)</label>
                            <input
                                type="text"
                                className="w-full h-9 text-sm border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                placeholder="Food & Beverage"
                                value={form.label_en}
                                onChange={(e) => setForm((f) => ({ ...f, label_en: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Value (Backend)</label>
                            <input
                                type="text"
                                className="w-full h-9 text-sm border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-mono"
                                placeholder="Gıda Endüstrisi"
                                value={form.value}
                                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Sıra</label>
                            <input
                                type="number"
                                className="w-full h-9 text-sm border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                value={form.sort_order}
                                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Açıklama (TR)</label>
                            <input
                                type="text"
                                className="w-full h-9 text-sm border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Description (EN)</label>
                            <input
                                type="text"
                                className="w-full h-9 text-sm border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                value={form.description_en}
                                onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                            <Tag size={11} className="inline mr-1" />
                            Eşleştirme Etiketleri (match_tags)
                        </label>
                        <p className="text-[10px] text-slate-400 mb-2">
                            Matching servisi bu etiketleri ürünlerle eşleştirmek için kullanır.
                        </p>
                        <TagsManager
                            value={form.match_tags}
                            onChange={(val) => setForm((f) => ({ ...f, match_tags: val }))}
                            placeholder="Örn: kozmetik, stabilite-testi..."
                        />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs text-slate-600">Aktif</span>
                    </label>
                </div>
                <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                        İptal
                    </button>
                    <button
                        onClick={() => onSave(form)}
                        disabled={saving || !form.label || !form.value}
                        className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {saving && <Loader2 size={12} className="animate-spin" />}
                        Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Option Row ──────────────────────────────────────────────────────────────

function OptionRow({
    option,
    onEdit,
    onDelete,
}: {
    option: WizardOption;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-25 group">
            <GripVertical size={12} className="text-slate-300 shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">{option.label}</span>
                    {option.label_en && (
                        <span className="text-[10px] text-slate-400">/ {option.label_en}</span>
                    )}
                    {!option.is_active && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-400 rounded">
                            Pasif
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <code className="text-[10px] text-slate-400 font-mono">{option.value}</code>
                    {option.match_tags.length > 0 && (
                        <div className="flex items-center gap-1">
                            <Tag size={9} className="text-violet-400" />
                            <span className="text-[10px] text-violet-500 font-medium">
                                {option.match_tags.join(", ")}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onEdit}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                >
                    <Pencil size={12} />
                </button>
                <button
                    onClick={onDelete}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                >
                    <Trash2 size={12} />
                </button>
            </div>
        </div>
    );
}

// ─── Sortable Step Card ──────────────────────────────────────────────────────

function SortableStepCard({
    step,
    index,
    onEditStep,
    onDeleteStep,
    onAddOption,
    onEditOption,
    onDeleteOption,
}: {
    step: WizardStepWithOptions;
    index: number;
    onEditStep: () => void;
    onDeleteStep: () => void;
    onAddOption: () => void;
    onEditOption: (opt: WizardOption) => void;
    onDeleteOption: (optId: number) => void;
}) {
    const [expanded, setExpanded] = useState(true);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: step.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white border rounded-xl shadow-sm overflow-hidden ${step.is_active ? "border-slate-200" : "border-slate-100 opacity-60"} ${isDragging ? "ring-2 ring-indigo-300" : ""}`}
        >
            {/* Step header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
                <button
                    className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none"
                    {...attributes}
                    {...listeners}
                    title="Sürükle & bırak ile sırala"
                >
                    <GripVertical size={16} />
                </button>
                <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-slate-600">
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                    {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{step.title || step.field_key}</span>
                        <code className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded">
                            {step.field_key}
                        </code>
                        {step.is_active ? (
                            <Eye size={12} className="text-emerald-500" />
                        ) : (
                            <EyeOff size={12} className="text-slate-400" />
                        )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {step.prefix} <span className="text-indigo-400 font-medium">[...]</span> {step.suffix}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-[10px] font-medium text-slate-400 mr-1">
                        {step.options.length} seçenek
                    </span>
                    <button
                        onClick={onEditStep}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                        title="Adımı düzenle"
                    >
                        <Pencil size={13} />
                    </button>
                    <button
                        onClick={onDeleteStep}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                        title="Adımı sil"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            {/* Options */}
            {expanded && (
                <div>
                    {step.options.length > 0 ? (
                        step.options.map((opt) => (
                            <OptionRow
                                key={opt.id}
                                option={opt}
                                onEdit={() => onEditOption(opt)}
                                onDelete={() => onDeleteOption(opt.id)}
                            />
                        ))
                    ) : (
                        <div className="px-5 py-4 text-center text-xs text-slate-400">
                            Henüz seçenek eklenmemiş
                        </div>
                    )}
                    <div className="px-4 py-2.5 border-t border-slate-50">
                        <button
                            onClick={onAddOption}
                            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Plus size={13} />
                            Seçenek Ekle
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function WizardStepsPage() {
    const [searchParams] = useSearchParams();
    const siteId = Number(searchParams.get("site_id") || "1");
    const queryClient = useQueryClient();

    // Modal states
    const [stepModal, setStepModal] = useState<{ open: boolean; editing?: WizardStepWithOptions }>({ open: false });
    const [optionModal, setOptionModal] = useState<{ open: boolean; stepId: number; editing?: WizardOption }>({ open: false, stepId: 0 });
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: "step" | "option"; id: number } | null>(null);

    // ─── Queries ─────────────────────────────────────────────────────────────────

    const { data, isLoading, error } = useQuery({
        queryKey: ["wizard-steps", siteId],
        queryFn: () => api.getWizardSteps(siteId),
    });
    const steps: WizardStepWithOptions[] = data?.data ?? [];

    // ─── Mutations ───────────────────────────────────────────────────────────────

    const invalidate = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["wizard-steps", siteId] });
    }, [queryClient, siteId]);

    const createStepMut = useMutation({
        mutationFn: (payload: WizardStepPayload) => api.createWizardStep(siteId, payload),
        onSuccess: () => { invalidate(); setStepModal({ open: false }); },
    });

    const updateStepMut = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: WizardStepPayload }) => api.updateWizardStep(id, payload),
        onSuccess: () => { invalidate(); setStepModal({ open: false }); },
    });

    const deleteStepMut = useMutation({
        mutationFn: (id: number) => api.deleteWizardStep(id),
        onSuccess: () => { invalidate(); setDeleteConfirm(null); },
    });

    const createOptionMut = useMutation({
        mutationFn: ({ stepId, payload }: { stepId: number; payload: WizardOptionPayload }) => api.createWizardOption(stepId, payload),
        onSuccess: () => { invalidate(); setOptionModal({ open: false, stepId: 0 }); },
    });

    const updateOptionMut = useMutation({
        mutationFn: ({ optionId, payload }: { optionId: number; payload: WizardOptionPayload }) => api.updateWizardOption(optionId, payload),
        onSuccess: () => { invalidate(); setOptionModal({ open: false, stepId: 0 }); },
    });

    const deleteOptionMut = useMutation({
        mutationFn: (id: number) => api.deleteWizardOption(id),
        onSuccess: () => { invalidate(); setDeleteConfirm(null); },
    });

    // ─── Handlers ────────────────────────────────────────────────────────────────

    const handleSaveStep = useCallback(
        (formData: StepFormData) => {
            const payload: WizardStepPayload = {
                step_number: 0,
                field_key: formData.field_key,
                title: formData.title || null,
                title_en: formData.title_en || null,
                prefix: formData.prefix || null,
                prefix_en: formData.prefix_en || null,
                suffix: formData.suffix || null,
                suffix_en: formData.suffix_en || null,
                is_active: formData.is_active,
            };
            if (stepModal.editing) {
                updateStepMut.mutate({ id: stepModal.editing.id, payload });
            } else {
                createStepMut.mutate(payload);
            }
        },
        [stepModal.editing, createStepMut, updateStepMut]
    );

    const handleSaveOption = useCallback(
        (formData: OptionFormData) => {
            const payload: WizardOptionPayload = {
                label: formData.label,
                label_en: formData.label_en || null,
                value: formData.value,
                description: formData.description || null,
                description_en: formData.description_en || null,
                match_tags: formData.match_tags,
                sort_order: formData.sort_order,
                is_active: formData.is_active,
            };
            if (optionModal.editing) {
                updateOptionMut.mutate({ optionId: optionModal.editing.id, payload });
            } else {
                createOptionMut.mutate({ stepId: optionModal.stepId, payload });
            }
        },
        [optionModal, createOptionMut, updateOptionMut]
    );

    const reorderMut = useMutation({
        mutationFn: (order: number[]) => api.reorderWizardSteps(siteId, order),
        onSuccess: () => invalidate(),
    });

    const confirmDelete = useCallback(() => {
        if (!deleteConfirm) return;
        if (deleteConfirm.type === "step") {
            deleteStepMut.mutate(deleteConfirm.id);
        } else {
            deleteOptionMut.mutate(deleteConfirm.id);
        }
    }, [deleteConfirm, deleteStepMut, deleteOptionMut]);

    // ─── Drag & Drop ──────────────────────────────────────────────────────────────

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = steps.findIndex((s) => s.id === active.id);
            const newIndex = steps.findIndex((s) => s.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return;

            const reordered = [...steps];
            const [moved] = reordered.splice(oldIndex, 1);
            reordered.splice(newIndex, 0, moved);

            const newOrder = reordered.map((s) => s.id);
            reorderMut.mutate(newOrder);
        },
        [steps, reorderMut]
    );

    // ─── Render ──────────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-rose-500 gap-2">
                <AlertCircle size={18} />
                <span className="text-sm">Veriler yüklenirken hata oluştu</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                        <Wand2 size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">Sihirbaz Yönetimi</h1>
                        <p className="text-xs text-slate-400">Laboratuvar Kurulum Sihirbazı adım ve seçeneklerini yönetin</p>
                    </div>
                </div>
                <button
                    onClick={() => setStepModal({ open: true })}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                    <Plus size={14} />
                    Yeni Adım
                </button>
            </div>

            {/* Steps list */}
            {steps.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center">
                    <Wand2 size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-500 mb-1">Henüz adım eklenmemiş</p>
                    <p className="text-xs text-slate-400 mb-4">Sihirbaz için ilk adımı oluşturun</p>
                    <button
                        onClick={() => setStepModal({ open: true })}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
                    >
                        <Plus size={14} />
                        İlk Adımı Oluştur
                    </button>
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                            {steps.map((step, idx) => (
                                <SortableStepCard
                                    key={step.id}
                                    step={step}
                                    index={idx}
                                    onEditStep={() =>
                                        setStepModal({
                                            open: true,
                                            editing: step,
                                        })
                                    }
                                    onDeleteStep={() => setDeleteConfirm({ type: "step", id: step.id })}
                                    onAddOption={() => setOptionModal({ open: true, stepId: step.id })}
                                    onEditOption={(opt: WizardOption) =>
                                        setOptionModal({ open: true, stepId: step.id, editing: opt })
                                    }
                                    onDeleteOption={(optId: number) => setDeleteConfirm({ type: "option", id: optId })}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Step form modal */}
            {stepModal.open && (
                <StepFormModal
                    initial={
                        stepModal.editing
                            ? {
                                  field_key: stepModal.editing.field_key,
                                  title: stepModal.editing.title ?? "",
                                  title_en: stepModal.editing.title_en ?? "",
                                  prefix: stepModal.editing.prefix ?? "",
                                  prefix_en: stepModal.editing.prefix_en ?? "",
                                  suffix: stepModal.editing.suffix ?? "",
                                  suffix_en: stepModal.editing.suffix_en ?? "",
                                  is_active: stepModal.editing.is_active,
                              }
                            : undefined
                    }
                    onSave={handleSaveStep}
                    onClose={() => setStepModal({ open: false })}
                    saving={createStepMut.isPending || updateStepMut.isPending}
                />
            )}

            {/* Option form modal */}
            {optionModal.open && (
                <OptionFormModal
                    initial={
                        optionModal.editing
                            ? {
                                  label: optionModal.editing.label,
                                  label_en: optionModal.editing.label_en ?? "",
                                  value: optionModal.editing.value,
                                  description: optionModal.editing.description ?? "",
                                  description_en: optionModal.editing.description_en ?? "",
                                  match_tags: optionModal.editing.match_tags,
                                  sort_order: optionModal.editing.sort_order,
                                  is_active: optionModal.editing.is_active,
                              }
                            : undefined
                    }
                    onSave={handleSaveOption}
                    onClose={() => setOptionModal({ open: false, stepId: 0 })}
                    saving={createOptionMut.isPending || updateOptionMut.isPending}
                />
            )}

            {/* Delete confirmation modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                                <Trash2 size={18} className="text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800">Silmek istediğinize emin misiniz?</h3>
                                <p className="text-xs text-slate-400">
                                    {deleteConfirm.type === "step"
                                        ? "Adım ve tüm seçenekleri silinecek."
                                        : "Bu seçenek kalıcı olarak silinecek."}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                            >
                                İptal
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleteStepMut.isPending || deleteOptionMut.isPending}
                                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {(deleteStepMut.isPending || deleteOptionMut.isPending) && (
                                    <Loader2 size={12} className="animate-spin" />
                                )}
                                Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
