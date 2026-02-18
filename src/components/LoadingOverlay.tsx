import React from 'react';
import { kt_logo } from '../assets';

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = "Processing your request..." }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md transition-all duration-700">
            <div className="relative flex flex-col items-center max-w-md w-full px-8">
                {/* Premium Logo Animation Container */}
                <div className="relative mb-16 group">
                    {/* Pulsing Outer Rings */}
                    {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-[#e1b250]/20 rounded-full animate-[ping_3s_linear_infinite]"></div> */}
                    {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#e1b250]/5 rounded-full animate-pulse blur-xl"></div> */}

                    {/* The KT Logo */}
                    <div className="relative z-10 flex flex-col items-center">
                        <img src={kt_logo} alt="Khaleej Times" className="w-60 object-contain mb-4 brightness-0" />
                        {/* Elegant under-line */}
                        <div className="w-12 h-1 bg-[#e1b250] rounded-full mt-[-8px] animate-[width-grow_2s_ease-in-out_infinite]"></div>
                    </div>
                </div>

                {/* Animated Progress Bar Container */}
                <div className="w-full space-y-6 flex flex-col items-center">
                    <div className="w-full h-[3px] bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
                        {/* Shimmering loader */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e1b250]/30 to-transparent w-full animate-[shimmer_2s_infinite]"></div>
                        {/* Main progress indicator */}
                        <div className="h-full bg-gradient-to-r from-[#20255c] to-[#e1b250] rounded-full w-[40%] animate-[premium-loading_3s_infinite_ease-in-out]"></div>
                    </div>

                    {/* Typography & Status */}
                    <div className="text-center space-y-2">
                        <h2 className="text-[#20255c] font-bold text-xl tracking-tight uppercase">
                            {message}
                        </h2>
                        <div className="flex items-center justify-center gap-2">
                            <span className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-[#e1b250] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-[#e1b250] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-[#e1b250] rounded-full animate-bounce"></span>
                            </span>
                            {/* <p className="text-gray-400 text-sm font-medium italic">
                                Crafting your visuals with AI
                            </p> */}
                        </div>
                    </div>
                </div>

                {/* Corner Decorative Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-[#e1b250]/10 rounded-tl-3xl"></div>
                <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-[#e1b250]/10 rounded-br-3xl"></div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes premium-loading {
          0% { transform: translateX(-100%) scaleX(0.5); }
          50% { transform: translateX(50%) scaleX(1.5); }
          100% { transform: translateX(200%) scaleX(0.5); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes width-grow {
          0%, 100% { width: 24px; opacity: 0.5; }
          50% { width: 64px; opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
        </div>
    );
};

export default LoadingOverlay;
