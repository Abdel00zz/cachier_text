
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Chapter } from '../../types';

interface DeleteChaptersModalProps {
    isOpen: boolean;
    onClose: () => void;
    chapters: Chapter[];
    onConfirmDelete: (indices: number[]) => void;
}

const DeleteChaptersModal: React.FC<DeleteChaptersModalProps> = ({ isOpen, onClose, chapters, onConfirmDelete }) => {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSelectedIndices([]);
        }
    }, [isOpen]);

    const handleToggle = (index: number) => {
        setSelectedIndices(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleSelectAll = () => {
        if (selectedIndices.length === chapters.length) {
            setSelectedIndices([]);
        } else {
            setSelectedIndices(chapters.map((_, i) => i));
        }
    };

    const footer = (
        <>
            <button onClick={handleSelectAll} className="mr-auto px-4 py-2 rounded-button text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300">
                {selectedIndices.length === chapters.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-button text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300">Annuler</button>
            <button 
                onClick={() => onConfirmDelete(selectedIndices)} 
                disabled={selectedIndices.length === 0}
                className="px-4 py-2 rounded-button text-sm font-medium bg-danger text-white hover:bg-danger/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Supprimer
            </button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Supprimer des chapitres" footer={footer}>
            <p className="mb-4">Sélectionnez les chapitres à supprimer :</p>
            <ul className="list-none m-0 p-0">
                {chapters.length > 0 ? chapters.map((chapter, index) => (
                    <li key={index} className="flex items-center p-3 border rounded-lg mb-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <input
                            type="checkbox"
                            id={`chap-${index}`}
                            checked={selectedIndices.includes(index)}
                            onChange={() => handleToggle(index)}
                            className="mr-4 w-5 h-5 cursor-pointer accent-primary"
                        />
                        <label htmlFor={`chap-${index}`} className="flex-1 font-medium cursor-pointer">{chapter.chapter || `Chapitre ${index + 1}`}</label>
                        <span className="text-text-light text-sm">{chapter.sections?.length || 0} section(s)</span>
                    </li>
                )) : (
                     <p className="text-center text-text-light italic">Aucun chapitre à supprimer.</p>
                )}
            </ul>
        </Modal>
    );
};

export default DeleteChaptersModal;
