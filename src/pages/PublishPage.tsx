import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import BaseLayout from '../components/BaseLayout';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import LoadingOverlay from '../components/LoadingOverlay';

import { generateCompositedImage, getBestAspectRatio } from '../lib/image-renderer';

const PublishPage: React.FC = () => {
    const location = useLocation();
    const { imageUrl, cards, caption, title, category, aspectRatio, template } = location.state || {};

    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Facebook', 'Instagram', 'Twitter']);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishStatus, setPublishStatus] = useState<string>('');

    const platforms = [
        { name: 'Facebook', id: 'facebook', icon: 'https://cdn-icons-png.flaticon.com/512/124/124010.png', connected: true },
        { name: 'Instagram', id: 'instagram', icon: 'https://cdn-icons-png.flaticon.com/512/174/174855.png', connected: true },
        { name: 'Twitter', id: 'twitter', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968830.png', connected: true }
    ];

    const togglePlatform = (name: string) => {
        if (selectedPlatforms.includes(name)) {
            setSelectedPlatforms(selectedPlatforms.filter(p => p !== name));
        } else {
            setSelectedPlatforms([...selectedPlatforms, name]);
        }
    };

    const handlePublish = async () => {
        if ((!imageUrl && !cards) || !caption) {
            toast.error('No media content found to publish');
            return;
        }

        const targetPlatforms = selectedPlatforms
            .filter(p => ['Facebook', 'Instagram', 'Twitter'].includes(p))
            .map(p => p.toLowerCase() as 'facebook' | 'instagram' | 'twitter');

        if (targetPlatforms.length === 0) {
            toast.error('Please select Facebook or Instagram or Twitter to publish');
            return;
        }

        setIsPublishing(true);
        const toastId = toast.loading('Preparing your creatives...');

        try {
            const itemsToProcess = cards || [{ image: imageUrl, title, category }];
            const publicUrls: string[] = [];

            // 1. Process each image sequentially
            for (let i = 0; i < itemsToProcess.length; i++) {
                const item = itemsToProcess[i];
                const currentTitle = item.title || title || '';
                const currentCategory = item.category || category || 'NEWS';
                const currentImageUrl = item.image || item.imageUrl || imageUrl;

                setPublishStatus(`Rendering card ${i + 1} of ${itemsToProcess.length}...`);

                // A. Render Composited Image
                const finalAspectRatio = aspectRatio || getBestAspectRatio(selectedPlatforms);
                const compositedBlob = await generateCompositedImage({
                    imageUrl: currentImageUrl,
                    title: currentTitle,
                    category: currentCategory,
                    aspectRatio: finalAspectRatio,
                    template: template,
                    isFollowUp: i > 0
                });

                // B. Upload to Supabase Storage
                setPublishStatus(`Uploading card ${i + 1} to cloud storage...`);
                const timestamp = Date.now();
                const fileName = `post_${timestamp}_${i}.jpg`;
                const { error: uploadError } = await supabase.storage
                    .from('kt-social-posts')
                    .upload(fileName, compositedBlob, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    throw new Error(`Failed to upload image ${i + 1} to storage.`);
                }

                // C. Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('kt-social-posts')
                    .getPublicUrl(fileName);

                publicUrls.push(publicUrl);
            }

            // 2. Call Publish Function (passing imageUrls array)
            setPublishStatus('Publishing to selected platforms...');
            const { data, error } = await supabase.functions.invoke('auto-post-media', {
                body: {
                    imageUrls: publicUrls,
                    caption,
                    platforms: targetPlatforms
                }
            });

            if (error || !data?.success) {
                console.error('Publish error:', error || data?.error);
                toast.error(`Failed to publish: ${error?.message || data?.error || 'Unknown error'}`, { id: toastId });
            } else {
                toast.success('Successfully published to selected platforms!', { id: toastId });
            }
        } catch (err: any) {
            console.error('Publish unexpected error:', err);
            toast.error(`Error: ${err.message}`, { id: toastId });
        } finally {
            setIsPublishing(false);
            setPublishStatus('');
        }
    };

    return (
        <BaseLayout>
            <LoadingOverlay isVisible={isPublishing} message={publishStatus || "Publishing your content..."} />
            <div className="flex flex-col h-full relative">
                <div className="flex-1 p-12">
                    <div className="border border-gray-100 rounded-lg p-8 bg-white shadow-sm inline-block min-w-full">
                        {/* Header */}
                        <div className="flex border rounded-lg overflow-hidden w-fit mb-12 bg-white shadow-sm border-gray-100">
                            <div className="px-8 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest italic">
                                Choose Platforms
                            </div>
                        </div>

                        {/* Platform Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                            {platforms.map((platform) => (
                                <div key={platform.name} className="flex flex-col items-center">
                                    <div className="relative mb-4">
                                        <button
                                            onClick={() => togglePlatform(platform.name)}
                                            className={`w-36 aspect-square rounded-[30px] border flex items-center justify-center p-6 transition-all ${selectedPlatforms.includes(platform.name)
                                                ? 'border-gray-200 bg-white shadow-md ring-2 ring-brand-golden/20'
                                                : 'border-gray-100 bg-gray-50 opacity-60'
                                                }`}
                                        >
                                            <img src={platform.icon} alt={platform.name} className="w-full h-full object-contain" />
                                        </button>

                                        {selectedPlatforms.includes(platform.name) && (
                                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#e1b250] rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
                                                <Check size={16} strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>

                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 transition-colors ${platform.connected ? 'bg-[#4ade80] text-gray-900' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${platform.connected ? 'bg-white' : 'bg-gray-300'}`} />
                                        Connected
                                    </div>

                                    {/* <div className="w-36 h-8 bg-[#1e293b] rounded-md flex items-center justify-center">
                                        <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] italic">Published</span>
                                    </div> */}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="fixed bottom-0 left-64 right-0 h-20 bg-white border-t border-gray-100 flex items-center justify-end px-12">
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="bg-[#e1b250] text-white font-bold h-full px-16 flex items-center gap-4 text-xl tracking-widest hover:bg-[#d4a345] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        PUBLISH
                        <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </BaseLayout>
    );
};

export default PublishPage;
