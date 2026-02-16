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
    const { imageUrl, caption, title, category } = location.state || {};

    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Facebook', 'Instagram']);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishStatus, setPublishStatus] = useState<string>('');

    const platforms = [
        { name: 'Facebook', id: 'facebook', icon: 'https://cdn-icons-png.flaticon.com/512/124/124010.png', connected: true },
        { name: 'Instagram', id: 'instagram', icon: 'https://cdn-icons-png.flaticon.com/512/174/174855.png', connected: true },
        // { name: 'Twitter', id: 'twitter', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968830.png', connected: true },
        // { name: 'LinkedIn', id: 'linkedin', icon: 'https://cdn-icons-png.flaticon.com/512/174/174857.png', connected: true },
        // { name: 'YouTube', id: 'youtube', icon: 'https://cdn-icons-png.flaticon.com/512/174/174883.png', connected: true },
    ];

    const togglePlatform = (name: string) => {
        if (selectedPlatforms.includes(name)) {
            setSelectedPlatforms(selectedPlatforms.filter(p => p !== name));
        } else {
            setSelectedPlatforms([...selectedPlatforms, name]);
        }
    };

    const handlePublish = async () => {
        if (!imageUrl || !caption) {
            toast.error('No media content found to publish');
            return;
        }

        const targetPlatforms = selectedPlatforms
            .filter(p => ['Facebook', 'Instagram'].includes(p))
            .map(p => p.toLowerCase() as 'facebook' | 'instagram');

        if (targetPlatforms.length === 0) {
            toast.error('Please select Facebook or Instagram to publish');
            return;
        }

        setIsPublishing(true);
        const toastId = toast.loading('Preparing your creative...');

        try {
            // 1. Render Composited Image
            setPublishStatus('Rendering branded creative...');

            // Determine best aspect ratio based on selected platforms if "Auto" is desired
            // For now, we use getBestAspectRatio if no specific ratio was passed or if we want to be smart
            const finalAspectRatio = getBestAspectRatio(selectedPlatforms);

            const compositedBlob = await generateCompositedImage({
                imageUrl,
                title: title || '',
                category: category || 'NEWS',
                aspectRatio: finalAspectRatio
            });

            // 2. Upload to Supabase Storage
            setPublishStatus('Uploading to cloud storage...');
            const fileName = `post_${Date.now()}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from('kt-social-posts')
                .upload(fileName, compositedBlob, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw new Error('Failed to upload image to storage. Make sure "kt-social-posts" bucket exists.');
            }

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('kt-social-posts')
                .getPublicUrl(fileName);

            console.log('Public URL:', publicUrl);

            // 4. Call Publish Function
            setPublishStatus('Publishing to selected platforms...');
            const { data, error } = await supabase.functions.invoke('auto-post-media', {
                body: {
                    imageUrl: publicUrl,
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
