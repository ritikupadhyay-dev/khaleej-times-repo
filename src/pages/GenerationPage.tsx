import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import BaseLayout from '../components/BaseLayout';
import CaptionControll from '../components/CaptionControll';
import GenerationHeader from '../components/GenerationHeader';
import BottomBar from '../components/BottomBar';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { sanitizeUrl, proxyIfNeeded } from '../lib/utils';
import LoadingOverlay from '../components/LoadingOverlay';
import type { AspectRatio, TemplateId } from '../lib/image-renderer';
import { default_image, kt_logo, khaleej_times_white_logo } from '../assets';

const GenerationPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('url');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [template, setTemplate] = useState<TemplateId>('classic');
    const date = new Date();
    const city = "DUBAI";
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const dateString = `${month} ${day}, ${year} | ${city}`;

    // const formatter = new Intl.DateTimeFormat('en-US', {
    //     month: 'short',
    //     day: '2-digit',
    //     year: 'numeric'
    // });

    useEffect(() => {
        const savedTemplate = localStorage.getItem('kt-post-template') as TemplateId;
        if (savedTemplate) {
            setTemplate(savedTemplate);
        }
    }, []);

    // Content State
    const [content, setContent] = useState({
        title: 'UAE minister announces school bus trips now capped at 45–60 minutes',
        category: 'EDUCATION',
        caption: '🚌 Just In : The UAE Ministry of Education has introduced new limits on school bus journeys — now capped at 45 minutes for KG students and 60 minutes for all other pupils to support student wellbeing.',
        tags: ['#UAENews', '#SchoolTransport', '#StudentWellbeing', '#ParentsInUAE', '#UAEEducation', '#SchoolBus']
    });

    const handleUpdate = (field: string, value: string | string[]) => {
        setContent((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleUrlBasedGeneration = async (url: string) => {
        setIsGenerating(true);
        try {
            toast.loading('Extracting content from URL...', { id: 'url-extract' });

            const { data: extractData, error } = await supabase.functions.invoke('extract-from-url', {
                body: {
                    url: url,
                    refine: true,
                    platform: 'khaleej-times', // Default platform
                    includeSubCaption: true
                }
            });

            if (error || !extractData?.success) {
                console.error('URL extraction error:', error || extractData?.error);
                toast.error('Failed to extract content from URL', { id: 'url-extract' });
                return;
            }

            toast.success('Content extracted successfully!', { id: 'url-extract' });

            // Update content state with extracted data
            setContent({
                title: extractData.content.overlay_text || extractData.metadata.title || '',
                category: extractData.content.category || 'NEWS',
                caption: extractData.metadata.description || '',
                tags: extractData.content.tags || []
            });

            if (extractData.metadata.ogImage) {
                const cleanedUrl = sanitizeUrl(extractData.metadata.ogImage);
                const proxiedImageUrl = proxyIfNeeded(cleanedUrl);
                setGeneratedImage(proxiedImageUrl);
                toast.success('Using article image as background');
            } else {
                toast.error('No image found in the article');
            }

        } catch (error) {
            console.error('URL-based generation failed:', error);
            toast.error('Failed to process URL', { id: 'url-extract' });
        } finally {
            setIsGenerating(false);
        }
    };

    const tabs = [
        { id: 'url', label: 'Enter URL' },
        { id: 'upload', label: 'Upload Image' },
        { id: 'prompt', label: 'Enter Prompt' },
    ];

    const ratios: { label: string; value: AspectRatio }[] = [
        { label: 'SQUARE (1:1)', value: '1:1' },
        { label: 'LANDSCAPE (16:9)', value: '16:9' },
        { label: 'PORTRAIT (4:5)', value: '4:5' },
        { label: 'STORY (9:16)', value: '9:16' },
    ];

    const handleNext = () => {
        navigate('/publish', {
            state: {
                imageUrl: generatedImage || default_image,
                caption: `${content.caption}\n\n${content.tags.join(' ')}`,
                title: content.title,
                category: content.category,
                aspectRatio: aspectRatio,
                template: template
            }
        });
    };

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setGeneratedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <BaseLayout>
            <LoadingOverlay isVisible={isGenerating} />
            <div className="flex flex-col h-full">
                <div className="flex-1 p-8 pb-32">
                    <GenerationHeader
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onUrlSubmit={handleUrlBasedGeneration}
                        onImageUpload={handleImageUpload}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1400px] mx-auto">
                        {/* Left Main Content - Creative Grid Preview */}
                        <div className="lg:col-span-8 flex flex-col">
                            <div className="bg-[#fcfcfc] border border-gray-200 rounded-sm overflow-hidden shadow-sm flex-1">
                                <div className="bg-[#F4F4F4] px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-black uppercase tracking-widest italic">Multi-Layout Preview</span>
                                    <div className="flex gap-4">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            Auto-Optimization Active
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50 overflow-y-auto max-h-[700px]">
                                    <div className="grid grid-cols-2 gap-6 items-start">
                                        {ratios.map((r, i) => (
                                            <div key={r.value} className={`flex flex-col gap-2 ${i === 3 ? 'relative top-[-175px]' : ''}`}>
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-[9px] font-black text-[#20255c] uppercase tracking-tighter opacity-60">{r.label}</span>
                                                    {aspectRatio === r.value && (
                                                        <span className="text-[9px] font-bold text-[#e1b250] uppercase italic">Selected</span>
                                                    )}
                                                </div>
                                                <div
                                                    onClick={() => setAspectRatio(r.value)}
                                                    className={`relative bg-white shadow-xl rounded-sm overflow-hidden border-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 duration-300 ${aspectRatio === r.value ? 'border-[#e1b250]' : 'border-transparent'} ${r.value === '1:1' ? 'aspect-square' :
                                                        r.value === '4:5' ? 'aspect-[4/5]' :
                                                            r.value === '16:9' ? 'aspect-[16/9]' :
                                                                'aspect-[9/16]'
                                                        }`}
                                                >
                                                    <img
                                                        src={generatedImage || default_image}
                                                        alt={r.label}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className={`absolute top-2 left-2 drop-shadow-lg ${r.value === '16:9' ? 'scale-50 origin-top-left' : 'scale-75 origin-top-left'} 
                                                        ${template === 'modern-center' ? 'top-8 left-0 right-16 flex flex-col align-center justify-center origin-top scale-125' : ''}
                                                        ${template === 'minimal-top' ? 'scale-50' : ''}`}>
                                                        <img src={template === 'modern-center' ? khaleej_times_white_logo : kt_logo} alt="Khaleej Times" className="w-32 self-center object-contain" />
                                                        {template == 'modern-center' && (
                                                            <p className='self-center text-white text-[10px] font-bold tracking-wider'>{dateString}</p>
                                                        )}
                                                    </div>

                                                    <div className={`absolute bottom-0 left-0 right-0 ${r.value === '9:16' ? 'p-10 pb-16' : 'p-6 pb-8'} 
                                                        bg-gradient-to-t from-black/95 via-black/40 to-transparent
                                                        ${template === 'modern-center' ? 'text-center' : ''}
                                                        ${template === 'minimal-top' ? 'border-l-4 border-[#e1b250] ml-6 mb-6 pt-2 pb-2 pl-4' : ''}`}>

                                                        {template !== 'minimal-top' && (
                                                            <div className={`inline-block bg-[#0070c0] text-white font-extrabold rounded-sm uppercase tracking-wider mb-2 shadow-sm ${r.value === '16:9' ? 'text-[8px] px-2 py-0.5' : 'text-[10px] px-3 py-1'}`}>
                                                                {content.category}
                                                            </div>
                                                        )}

                                                        <h3 className={`text-white font-rokkitt font-black leading-tight tracking-tight ${r.value === '16:9' ? 'text-xs' : r.value === '9:16' ? 'text-lg' : 'text-sm'}
                                                            ${template === 'minimal-top' ? 'italic' : ''}`}>
                                                            {content.title}
                                                        </h3>
                                                    </div>
                                                    {aspectRatio === r.value && (
                                                        <div className="absolute top-0 right-0 bg-[#e1b250] text-white p-1">
                                                            <Check size={12} strokeWidth={4} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side Panel */}
                        <div className="lg:col-span-4">
                            <CaptionControll
                                {...content}
                                onUpdate={handleUpdate}
                            />
                        </div>
                    </div>
                </div>

                <BottomBar onNext={handleNext} />
            </div>
        </BaseLayout>
    );
};

export default GenerationPage;
