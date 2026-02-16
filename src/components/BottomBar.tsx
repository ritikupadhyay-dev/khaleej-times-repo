import React from 'react';
import { ArrowRight } from 'lucide-react';

interface BottomBarProps {
    onNext: () => void;
    label?: string;
}

const BottomBar: React.FC<BottomBarProps> = ({ onNext, label = "NEXT" }) => {
    return (
        <div className="fixed bottom-0 left-[256px] right-0 h-[80px] bg-white border-t border-gray-100 flex items-center justify-end z-10">
            <button
                onClick={onNext}
                className="bg-[#e1b250] text-white font-bold h-full px-20 flex items-center gap-6 text-[22px] tracking-[0.1em] hover:bg-[#d4a345] transition-all group"
            >
                {label}
                <ArrowRight size={32} strokeWidth={2.5} className="group-hover:translate-x-2 transition-transform" />
            </button>
        </div>
    );
};

export default BottomBar;
