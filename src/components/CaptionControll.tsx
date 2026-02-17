import React, { useRef, useEffect } from 'react';
import { Edit2, RotateCcw } from 'lucide-react';

interface CaptionControllProps {
    title: string;
    category: string;
    caption: string;
    tags: string;
    isFollowUp?: boolean;
    onUpdate: (field: string, value: string | string[]) => void;
}

const CaptionControll: React.FC<CaptionControllProps> = ({
    title,
    category,
    caption,
    tags,
    isFollowUp = false,
    onUpdate
}) => {
    const titleRef = useRef<HTMLTextAreaElement>(null);
    const captionRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
        if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustHeight(titleRef);
    }, [title, isFollowUp]);

    useEffect(() => {
        adjustHeight(captionRef);
    }, [caption]);

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
                        ref={titleRef}
                        value={title}
                        onChange={(e) => onUpdate('title', e.target.value)}
                        className="w-full font-rokkitt font-extrabold text-[22px] leading-[1.1] text-black tracking-tight resize-none focus:outline-none border-none p-0 overflow-y-hidden"
                        rows={1}
                    />
                    {!isFollowUp && (
                        <div className="flex items-center justify-between mt-12 border-t-2 border-gray-100 pt-6">
                            <input
                                value={category}
                                onChange={(e) => onUpdate('category', e.target.value)}
                                className="text-[#0070c0] font-rokkitt font-extrabold text-[24px] italic tracking-tight uppercase w-full focus:outline-none border-none p-0"
                            />
                            <button className="text-gray-400 hover:text-navy p-1 transition-colors"><Edit2 size={16} /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Captions & Tags Box */}
            <div className="border border-gray-200 rounded-sm overflow-hidden bg-white shadow-sm min-h-[400px] flex flex-col">
                <div className="bg-[#F4F4F4] px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-black uppercase tracking-widest italic">Captions & Tags</span>
                    <div className="flex gap-4">
                        {/* <button className="text-gray-400 hover:text-navy p-1 transition-colors"><RotateCcw size={20} /></button> */}
                        <button className="text-gray-400 hover:text-navy p-1 transition-colors"><Edit2 size={20} /></button>
                    </div>
                </div>
                <div className="p-6 flex-1">
                    <textarea
                        ref={captionRef}
                        value={caption}
                        onChange={(e) => onUpdate('caption', e.target.value)}
                        className="w-full font-rokkitt text-[14px] text-gray-700 font-normal leading-relaxed mb-10 resize-none focus:outline-none border-none p-0 overflow-y-hidden"
                        rows={1}
                    />
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-auto border-t border-gray-100 pt-4">
                        <textarea
                            value={tags}
                            onChange={(e) => onUpdate('tags', e.target.value)}
                            className="w-full font-rokkitt font-bold text-[15px] text-[#0070c0] resize-none focus:outline-none border-none p-0 overflow-y-hidden"
                            placeholder="#Add #Hashtags #Here"
                            rows={5}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaptionControll;
