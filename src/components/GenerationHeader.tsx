import React from 'react';
import { ArrowRight, Upload, Type } from 'lucide-react';

interface Tab {
    id: string;
    label: string;
}

interface GenerationHeaderProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (id: string) => void;
    onUrlSubmit?: (url: string) => void;
    onImageUpload?: (file: File) => void;
    placeholder?: string;
}

const GenerationHeader: React.FC<GenerationHeaderProps> = ({
    tabs,
    activeTab,
    onTabChange,
    onUrlSubmit,
    onImageUpload,
    placeholder
}) => {
    const [url, setUrl] = React.useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        if (url && onUrlSubmit) {
            onUrlSubmit(url);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onImageUpload) {
            onImageUpload(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const renderInput = () => {
        switch (activeTab) {
            case 'upload':
                return (
                    <div
                        onClick={handleUploadClick}
                        className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-sm bg-[#fcfcfc] hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                        <div className="bg-[#20255c] p-3 rounded-full text-white mb-3 group-hover:scale-110 transition-transform">
                            <Upload size={24} />
                        </div>
                        <p className="text-sm font-bold text-gray-700">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG or WebP (max. 10MB)</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>
                );
            case 'prompt':
                return (
                    <div className="relative group mx-auto">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                            <Type size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Describe the post you want to generate (e.g., 'A modern city skyline at sunset')"
                            className="w-full bg-[#f8f8f8] border border-gray-200 rounded-sm pl-14 pr-24 py-5 focus:outline-none focus:ring-0 focus:border-[#e1b250] text-[15px] text-gray-600 placeholder:text-gray-400 font-light"
                        />
                        <button className="absolute right-0 top-0 bottom-0 w-20 bg-[#20255c] text-white flex items-center justify-center hover:bg-[#1a1e4a] transition-all">
                            <ArrowRight size={28} strokeWidth={2.5} />
                        </button>
                    </div>
                );
            default: // url
                return (
                    <div className="relative group mx-auto">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder || "https://www.khaleejtimes.com/uae/education/uae-school-bus-trips-duration-capped"}
                            className="w-full bg-[#f8f8f8] border border-gray-200 rounded-sm pl-6 pr-24 py-5 focus:outline-none focus:ring-0 focus:border-[#e1b250] text-[15px] text-gray-600 placeholder:text-gray-400 font-light"
                        />
                        <button
                            onClick={handleSubmit}
                            className="absolute right-0 top-0 bottom-0 w-20 bg-[#20255c] text-white flex items-center justify-center hover:bg-[#1a1e4a] transition-all"
                        >
                            <ArrowRight size={28} strokeWidth={2.5} />
                        </button>
                    </div>
                );
        }
    };

    const getInstructionText = () => {
        switch (activeTab) {
            case 'upload':
                return "Upload a high-quality image to generate optimized social media visuals";
            case 'prompt':
                return "Use AI to generate stunning visuals by describing your creative vision";
            default:
                return "";
        }
    };

    return (
        <div className="bg-white border border-[#e5e7eb] shadow-sm rounded-lg mb-4 mx-auto max-w-[1400px]">
            <div className="flex">
                {tabs.map((tab, index) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex-1 py-4 text-sm font-bold transition-all relative ${activeTab === tab.id
                            ? 'bg-[#e1b250] text-white shadow-inner'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            } ${index !== 0 ? 'border-l border-gray-200' : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Input Section */}
            <div className="p-4 border-t border-gray-100">
                {renderInput()}
                <p className="text-[12px] text-gray-400 mt-4 ml-1 italic font-light">
                    {getInstructionText()}
                </p>
            </div>
        </div>
    );
};

export default GenerationHeader;
