
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer: React.ReactNode;
    maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-3xl' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex justify-center items-center backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div 
                className={`bg-container-color rounded-xl shadow-2xl w-11/12 ${maxWidth} max-h-[90vh] flex flex-direction-column overflow-hidden animate-slideUp flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 px-6 bg-primary text-white rounded-t-xl">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} className="bg-transparent border-none text-2xl cursor-pointer text-white w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-white/20">
                        &times;
                    </button>
                </header>
                <main className="p-6 overflow-y-auto flex-1">
                    {children}
                </main>
                <footer className="p-4 px-6 flex justify-end gap-4 border-t border-border-color">
                    {footer}
                </footer>
            </div>
        </div>
    );
};

export default Modal;
