
import React from 'react';
import Modal from './Modal';
import { GUIDE_MARKDOWN } from '../../constants';

interface GuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
    const footer = (
        <button onClick={onClose} className="px-4 py-2 rounded-button text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300">Fermer</button>
    );
    
    const createMarkup = () => {
         const htmlContent = GUIDE_MARKDOWN
            .replace(/^# (.+)/gm, '<h1 class="text-2xl mb-6 text-center text-primary font-serif">$1</h1>')
            .replace(/^## (.+)/gm, '<h2 class="text-lg mt-8 mb-4 pb-2 border-b border-border-color text-primary font-semibold">$1</h2>')
            .replace(/^### (.+)/gm, '<h3 class="text-base mt-5 mb-2.5 text-text-color font-medium">$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code class="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono border border-primary/20">$1</code>')
            .replace(/<kbd>(.+?)<\/kbd>/g, '<kbd class="inline-block bg-gray-200 border border-gray-300 rounded px-1.5 py-0.5 text-sm font-mono text-gray-700 shadow-sm mx-0.5">$1</kbd>')
            .replace(/^\s*\n\* (.+)/gm, '<ul><li>$1</li></ul>')
            .replace(/<\/ul>\s?<ul>/g, '')
            .split('\n\n').map(p => {
                if(p.trim().startsWith('<ul>')) return p;
                return p.trim() ? `<p class="mb-4">${p.replace(/\n/g, '<br/>')}</p>` : ''
            }).join('')
            .replace(/<p><h1>/g, '<h1>').replace(/<\/h1><\/p>/g, '</h1>')
            .replace(/<p><h2>/g, '<h2>').replace(/<\/h2><\/p>/g, '</h2>')
            .replace(/<p><h3>/g, '<h3>').replace(/<\/h3><\/p>/g, '</h3>')
        return { __html: htmlContent };
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Guide d'utilisation" footer={footer} maxWidth="max-w-4xl">
            <div className="prose prose-sm max-w-none leading-relaxed" dangerouslySetInnerHTML={createMarkup()}></div>
        </Modal>
    );
};

export default GuideModal;
