import React, { useState, useEffect } from 'react';
import BaseLayout from '../components/BaseLayout';
import { Check, ArrowRight, Layers } from 'lucide-react';
import { kt_logo, default_image, khaleej_times_logo, khaleej_times_white_logo } from '../assets';
import toast from 'react-hot-toast';

export type TemplateId = 'classic' | 'modern-center' | 'minimal-top';

interface Template {
    id: TemplateId;
    name: string;
    description: string;
}

const templates: Template[] = [
    {
        id: 'classic',
        name: 'Classic Left',
        description: 'Traditional KT layout with logo and category on the left.'
    },
    {
        id: 'modern-center',
        name: 'Modern Center',
        description: 'Centered logo and category for a balanced, modern look.'
    },
    {
        id: 'minimal-top',
        name: 'Minimal Top',
        description: 'Clean layout with logo at the top and content below.'
    }
];

const SettingsPage: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic');

    useEffect(() => {
        const saved = localStorage.getItem('kt-post-template') as TemplateId;
        if (saved && templates.find(t => t.id === saved)) {
            setSelectedTemplate(saved);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('kt-post-template', selectedTemplate);
        toast.success(`Template "${templates.find(t => t.id === selectedTemplate)?.name}" saved!`);
    };

    const renderPreview = (templateId: TemplateId) => {
        const isSelected = selectedTemplate === templateId;

        return (
            <div
                onClick={() => setSelectedTemplate(templateId)}
                className={`relative group cursor-pointer transition-all duration-300 ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
            >
                {/* Checkmark for selection */}
                {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#e1b250] rounded-full flex items-center justify-center text-white z-20 shadow-lg border-2 border-white">
                        <Check size={14} strokeWidth={4} />
                    </div>
                )}

                <div className={`aspect-square rounded-sm overflow-hidden border-2 shadow-sm transition-all duration-300 bg-white ${isSelected ? 'border-[#e1b250] shadow-md' : 'border-transparent group-hover:border-gray-200'}`}>
                    <div className="relative w-full h-full bg-gray-50 overflow-hidden">
                        {/* Mock Image */}
                        <img src={default_image} className="w-full h-full object-cover opacity-80" alt="Preview" />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Template Specific Layouts */}
                        {templateId === 'classic' && (
                            <>
                                <div className="absolute top-4 left-4">
                                    <img src={kt_logo} className="w-16 brightness-0 invert" alt="Logo" />
                                </div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-[#0070c0] text-white text-[6px] px-1.5 py-0.5 rounded-sm inline-block mb-1 font-bold">CATEGORY</div>
                                    <div className="text-white text-[10px] font-bold leading-tight">CLASSIC LEFT TEMPLATE DESIGN</div>
                                </div>
                            </>
                        )}

                        {templateId === 'modern-center' && (
                            <>
                                <div className="absolute top-4 left-0 right-0 flex justify-center">
                                    <img src={khaleej_times_white_logo} className="w-20 brightness-0 invert" alt="Logo" />
                                </div>
                                <div className="absolute bottom-8 left-6 right-6 text-center">
                                    <div className="bg-[#0070c0] text-white text-[6px] px-1.5 py-0.5 rounded-sm inline-block mb-1 font-bold">TOP STORIES</div>
                                    <div className="text-white text-xs font-black uppercase tracking-tight leading-tight">MODERN CENTERED CONTENT LAYOUT</div>
                                </div>
                            </>
                        )}

                        {templateId === 'minimal-top' && (
                            <>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
                                    <img src={kt_logo} className="w-40 brightness-0" alt="Watermark" />
                                </div>
                                <div className="absolute top-6 left-6 right-6">
                                    <div className="flex justify-between items-center border-b border-white/30 pb-2">
                                        <img src={kt_logo} className="w-12 brightness-0 invert" alt="Logo" />
                                        <span className="text-white text-[6px] font-bold">FEB 16, 2026</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="text-white text-[11px] font-serif italic border-l-2 border-[#e1b250] pl-2 font-bold leading-tight">
                                        MINIMALIST DESIGN WITH VERTICAL ACCENTS
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-3 text-center">
                    <h3 className={`text-xs font-bold transition-colors ${isSelected ? 'text-[#20255c]' : 'text-gray-500'}`}>{templates.find(t => t.id === templateId)?.name}</h3>
                </div>
            </div>
        );
    };

    return (
        <BaseLayout>
            <div className="max-w-[1000px] mx-auto p-12 h-full flex flex-col">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-serif font-black text-[#20255c] italic tracking-tighter">SETTINGS</h1>
                        <p className="text-sm text-gray-500 mt-1">Customize your brand presence across all social channels</p>
                    </div>
                </div>

                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-[#e1b250]/10 p-2 rounded-lg">
                            <Layers className="text-[#e1b250]" size={20} />
                        </div>
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Post Templates</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-12 mb-12 flex-1 items-start">
                        {templates.map(t => (
                            <React.Fragment key={t.id}>
                                {renderPreview(t.id)}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-gray-50 flex justify-end">
                        <button
                            onClick={handleSave}
                            className="bg-[#e1b250] text-white px-10 py-4 rounded-lg font-bold flex items-center gap-3 hover:bg-[#d4a544] transition-all shadow-lg shadow-[#e1b250]/20 active:scale-95 group"
                        >
                            <span>SAVE CHANGES</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
};

export default SettingsPage;
