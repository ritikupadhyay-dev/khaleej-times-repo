import React from 'react';
import { Edit2, RotateCcw } from 'lucide-react';

interface CaptionControllProps {
    title: string;
    category: string;
    caption: string;
    tags: string[];
    onUpdate: (field: string, value: string | string[]) => void;
}

const CaptionControll: React.FC<CaptionControllProps> = ({
    title,
    category,
    caption,
    tags,
    onUpdate
}) => {
    return (
        <div className="space-y-6">
            {/* Title & Category Box */}
            <div className="border border-gray-200 rounded-sm overflow-hidden bg-white shadow-sm">
                <div className="bg-[#F4F4F4] px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-black uppercase tracking-widest italic">Title & Category</span>
                    <button className="text-gray-400 hover:text-navy p-1 transition-colors"><Edit2 size={16} /></button>
                </div>
                <div className="p-6">
                    <textarea
                        value={title}
                        onChange={(e) => onUpdate('title', e.target.value)}
                        className="w-full font-rokkitt font-extrabold text-[22px] leading-[1.1] text-black tracking-tight resize-none focus:outline-none border-none p-0 overflow-hidden"
                        rows={2}
                    />
                    <div className="flex items-center justify-between mt-12 border-t-2 border-gray-100 pt-6">
                        <input
                            value={category}
                            onChange={(e) => onUpdate('category', e.target.value)}
                            className="text-[#0070c0] font-rokkitt font-extrabold text-[24px] italic tracking-tight uppercase w-full focus:outline-none border-none p-0"
                        />
                        <button className="text-gray-400 hover:text-navy p-1 transition-colors"><Edit2 size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Captions & Tags Box */}
            <div className="border border-gray-200 rounded-sm overflow-hidden bg-white shadow-sm min-h-[400px] flex flex-col">
                <div className="bg-[#F4F4F4] px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-black uppercase tracking-widest italic">Captions & Tags</span>
                    <div className="flex gap-4">
                        <button className="text-gray-400 hover:text-navy p-1 transition-colors"><RotateCcw size={20} /></button>
                        <button className="text-gray-400 hover:text-navy p-1 transition-colors"><Edit2 size={20} /></button>
                    </div>
                </div>
                <div className="p-6 flex-1">
                    <textarea
                        value={caption}
                        onChange={(e) => onUpdate('caption', e.target.value)}
                        className="w-full font-rokkitt text-[14px] text-gray-700 font-normal leading-relaxed mb-10 resize-none focus:outline-none border-none p-0 overflow-hidden"
                        rows={5}
                    />
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-auto">
                        {tags.map((tag, index) => (
                            <span key={index} className="text-[#0070c0] font-bold text-[13px] hover:underline cursor-pointer">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaptionControll;
