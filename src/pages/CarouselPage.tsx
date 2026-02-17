import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import BaseLayout from '../components/BaseLayout';
import CaptionControll from '../components/CaptionControll';
import GenerationHeader from '../components/GenerationHeader';
import BottomBar from '../components/BottomBar';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { sanitizeUrl, proxyIfNeeded, decodeHtml } from '../lib/utils';
import LoadingOverlay from '../components/LoadingOverlay';
import type { AspectRatio, TemplateId } from '../lib/image-renderer';
import { kt_logo, khaleej_times_white_logo, default_image } from '../assets';

const CarouselPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('url');
    const [numCards, setNumCards] = useState(4);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [template, setTemplate] = useState<TemplateId>('classic');
    const [selectedCardIndex, setSelectedCardIndex] = useState(0);
    const date = new Date();
    const city = "DUBAI";
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const dateString = `${month} ${day}, ${year}`;
    // Content State
    const [content, setContent] = useState({
        title: 'UAE minister announces school bus trips now capped at 45–60 minutes',
        category: 'EDUCATION',
        caption: '🚌 Just In : The UAE Ministry of Education has introduced new limits on school bus journeys — now capped at 45 minutes for KG students and 60 minutes for all other pupils to support student wellbeing.',
        tags: '#KhaleejTimes #UAENews #SchoolTransport #StudentWellbeing #ParentsInUAE #UAEEducation #SchoolBus'
    });
    const [descriptions, setDescriptions] = useState<string[]>([]);

    useEffect(() => {
        const fetchContext = async () => {
            if (!content.title || !content.caption) return;
            // Only fetch if we don't have enough descriptions for the current numCards
            if (descriptions.length === numCards - 1) return;

            try {
                const { data: newData, error: err } = await supabase.functions.invoke('context-generator', {
                    body: {
                        title: content.title,
                        description: content.caption,
                        count: numCards - 1,
                    }
                });

                if (err) throw err;

                if (newData?.descriptions) {
                    setDescriptions(newData.descriptions);
                }

            } catch (error) {
                toast.error('Failed to generate context');
                console.error('Error invoking function:', error);
            }
        };

        fetchContext();
    }, [content.title, content.caption, numCards]);


    useEffect(() => {
        const savedTemplate = localStorage.getItem('kt-post-template') as TemplateId;
        if (savedTemplate) {
            setTemplate(savedTemplate);
        }
    }, []);

    const handleUpdate = (field: string, value: string | string[]) => {
        setContent((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleCardTitleUpdate = (field: string, newValue: string | string[]) => {
        if (field !== 'title') {
            handleUpdate(field, newValue);
            return;
        }

        const newTitle = newValue as string;
        if (selectedCardIndex === 0) {
            handleUpdate('title', newTitle);
        } else {
            const newDesc = [...descriptions];
            newDesc[selectedCardIndex - 1] = newTitle;
            setDescriptions(newDesc);
        }
    };

    const handleUrlBasedGeneration = async (url: string) => {
        setIsGenerating(true);
        try {
            toast.loading('Extracting content from URL...', { id: 'url-extract' });

            const { data: extractData, error } = await supabase.functions.invoke('extract-from-url', {
                body: {
                    url: url,
                    refine: true,
                    platform: 'khaleej-times',
                    includeSubCaption: true
                }
            });

            if (error || !extractData?.success) {
                console.error('URL extraction error:', error || extractData?.error);
                toast.error('Failed to extract content from URL', { id: 'url-extract' });
                return;
            }

            toast.success('Content extracted successfully!', { id: 'url-extract' });

            setContent({
                title: decodeHtml(extractData.content.overlay_text || extractData.metadata.title || ''),
                category: extractData.content.category || 'NEWS',
                caption: decodeHtml(extractData.metadata.description || ''),
                tags: (extractData.content.tags || []).join(' ')
            });

            if (extractData.metadata.ogImage) {
                const cleanedUrl = sanitizeUrl(extractData.metadata.ogImage);
                const proxiedImageUrl = proxyIfNeeded(cleanedUrl);
                setGeneratedImage(proxiedImageUrl);
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
        { label: 'PORTRAIT (4:5)', value: '4:5' },
        { label: 'LANDSCAPE (16:9)', value: '16:9' },
        { label: 'STORY (9:16)', value: '9:16' },
    ];

    const handleNext = () => {
        navigate('/publish', {
            state: {
                imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800",
                cards: cards,
                caption: `${content.caption}\n\n${content.tags}`,
                title: content.title,
                category: content.category,
                aspectRatio: aspectRatio,
                template: template
            }
        });
    };

    const handleIncrement = () => setNumCards(prev => Math.min(prev + 1, 10));
    const handledecrement = () => {
        setNumCards(prev => {
            const next = Math.max(prev - 1, 1);
            if (selectedCardIndex >= next) {
                setSelectedCardIndex(next - 1);
            }
            return next;
        });
    };

    const handleDecrement = () => handledecrement();

    // Dynamic cards data
    const cards = Array.from({ length: numCards }).map((_, i) => ({
        id: i,
        title: i === 0 ? content.title : (descriptions[i - 1] || content.title),
        category: i === 0 ? content.category : '',
        image: generatedImage || default_image
    }));

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

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1400px] mx-auto h-[calc(100vh-320px)]">
                        {/* Left Main Content - Carousel Grid Preview */}
                        <div className="lg:col-span-8 flex flex-col h-full bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                            <div className="bg-[#F4F4F4] px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                <span className="text-[11px] font-bold text-black uppercase tracking-widest italic">Carousel Layout Options</span>
                                <div className="flex gap-4">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        Auto-Select Enabled
                                    </span>
                                </div>
                            </div>

                            {/* Layout Controls - Aspect Ratio Select */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aspect Ratio</span>
                                    <div className="flex bg-gray-100 p-1 rounded-sm gap-1">
                                        {ratios.map((r) => (
                                            <button
                                                key={r.value}
                                                onClick={() => setAspectRatio(r.value)}
                                                className={`px-3 py-1.5 text-[10px] font-bold rounded-sm transition-all ${aspectRatio === r.value
                                                    ? 'bg-[#20255C] text-white shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                {r.label.split(' ')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center bg-[#f0f0f0] rounded-sm overflow-hidden">
                                    <div className="px-4 py-2 text-[11px] font-bold text-gray-600 uppercase">No. of cards</div>
                                    <button
                                        onClick={handleDecrement}
                                        className="bg-[#20255c] text-white p-2 hover:bg-[#1a1e4a] transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <div className="px-4 py-2 bg-white min-w-[40px] text-center font-bold text-sm">
                                        {numCards}
                                    </div>
                                    <button
                                        onClick={handleIncrement}
                                        className="bg-[#20255C] text-white p-2 hover:bg-[#1a1e4a] transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Carousel Cards Area - Scrollable View */}
                            <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 bg-[#fcfcfc] custom-scrollbar">
                                <div className="flex gap-8 h-full items-center min-w-max">
                                    {cards.map((card, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col gap-3 group cursor-pointer"
                                            onClick={() => setSelectedCardIndex(index)}
                                        >
                                            <div className="flex justify-between items-center px-1">
                                                <span className={`text-[10px] font-black uppercase tracking-tighter transition-opacity ${selectedCardIndex === index ? 'text-[#e1b250] opacity-100' : 'text-[#20255c] opacity-40 group-hover:opacity-100'}`}>
                                                    Card {index + 1} {selectedCardIndex === index && '• ACTIVE'}
                                                </span>
                                            </div>

                                            <div
                                                className={`relative bg-white shadow-2xl rounded-sm overflow-hidden border transition-all duration-500
                                                    ${selectedCardIndex === index ? 'ring-4 ring-[#e1b250] border-transparent scale-100' : 'border-gray-200'}
                                                    ${aspectRatio === '1:1' ? 'aspect-square h-[450px]' :
                                                        aspectRatio === '4:5' ? 'aspect-[4/5] h-[450px]' :
                                                            aspectRatio === '16:9' ? 'aspect-[16/9] w-[600px]' :
                                                                'aspect-[9/16] h-[550px]'
                                                    }`}
                                            >
                                                <img
                                                    src={card.image}
                                                    alt={`Card ${index + 1}`}
                                                    className={`w-full h-full object-cover transition-all duration-700 ${index > 0 ? 'blur-sm scale-105' : ''}`}
                                                />

                                                {/* Branding Overlay */}
                                                {index === 0 && (
                                                    <div className={`absolute drop-shadow-lg z-20 
                                                    ${template === 'modern-center'
                                                            ? 'top-8 left-0 right-0 flex flex-col items-center justify-center origin-top scale-150'
                                                            : `top-2 left-2 ${aspectRatio === '16:9' ? 'scale-50 origin-top-left' : 'scale-75 origin-top-left'} ${template === 'minimal-top' ? 'scale-50' : ''}`
                                                        }`}>
                                                        <img src={template === 'modern-center' ? khaleej_times_white_logo : kt_logo} alt="Khaleej Times" className="w-32 self-center object-contain" />
                                                        {template == 'modern-center' && (
                                                            <p className='self-center text-white text-[10px] font-bold tracking-wider mt-1'>{dateString}</p>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 via-black/20 to-transparent z-10" />

                                                <div className={`absolute ${index > 0 ? 'top-28' : 'bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent'} left-0 right-0 z-20 ${aspectRatio === '16:9' ? 'p-6' : 'p-8'} 
                                                    ${template === 'modern-center' ? 'text-center' : 'text-left'}
                                                    ${template === 'minimal-top' ? 'border-l-4 border-[#e1b250] ml-4 mb-4 pt-1 pb-1 pl-4' : ''}`}>

                                                    {template !== 'minimal-top' && index === 0 && (
                                                        <div className={`inline-block bg-[#0070c0] text-white font-extrabold rounded-sm uppercase tracking-wider mb-2 shadow-sm ${aspectRatio === '16:9' ? 'text-[8px] px-2 py-0.5' : 'text-[10px] px-3 py-1'}`}>
                                                            {card.category}
                                                        </div>
                                                    )}

                                                    <h3 className={`text-white font-rokkitt font-black leading-tight tracking-tight 
                                                        ${aspectRatio === '16:9' ? 'text-lg' : aspectRatio === '9:16' ? 'text-2xl' : 'text-xl'}
                                                        ${template === 'minimal-top' ? 'italic' : ''}`}>
                                                        {card.title}
                                                    </h3>
                                                </div>

                                                {/* Card Indicator */}
                                                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-[10px] font-black px-2 py-1 rounded-full z-30">
                                                    {index + 1}/{numCards}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Side Panel */}
                        <div className="lg:col-span-4 overflow-y-auto pr-2 space-y-6">
                            <div className="bg-[#20255c] text-white px-4 py-3 rounded-sm flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#e1b250] flex items-center justify-center text-[10px] font-black text-[#20255c]">
                                        {selectedCardIndex + 1}
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest italic">Editing {selectedCardIndex === 0 ? 'Hero Card' : `Card ${selectedCardIndex + 1}`}</span>
                                </div>
                                {selectedCardIndex > 0 && (
                                    <span className="text-[9px] font-bold text-[#e1b250] uppercase tracking-tighter bg-[#e1b250]/10 px-2 py-0.5 rounded-full border border-[#e1b250]/20">Follow-up Card</span>
                                )}
                            </div>

                            <CaptionControll
                                {...content}
                                title={selectedCardIndex === 0 ? content.title : (descriptions[selectedCardIndex - 1] || card_title_placeholder)}
                                isFollowUp={selectedCardIndex > 0}
                                onUpdate={handleCardTitleUpdate}
                            />
                        </div>
                    </div>
                </div>

                <BottomBar onNext={handleNext} />
            </div>
        </BaseLayout>
    );
};

const card_title_placeholder = "Generating description...";

export default CarouselPage;
