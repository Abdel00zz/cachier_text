
import React from 'react';

interface LoadingSpinnerProps {
    text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "Traitement..." }) => {
    return (
        <div className="fixed inset-0 bg-white/80 z-[2000] flex flex-col justify-center items-center">
            <div className="w-12 h-12 border-4 border-border-color border-t-primary rounded-full animate-spin"></div>
            {text && <div className="mt-4 font-semibold text-primary">{text}</div>}
        </div>
    );
};

export default LoadingSpinner;
