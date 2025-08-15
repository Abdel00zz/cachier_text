
import React, { useState, useRef } from 'react';
import Modal from './Modal';
import { LogbookData } from '../../types';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: LogbookData, mode: 'replace' | 'append') => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [jsonText, setJsonText] = useState('');
    const [fileName, setFileName] = useState('Aucun fichier sélectionné');
    const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                setJsonText(event.target?.result as string);
            };
            reader.readAsText(file);
        }
    };

    const handleImportClick = () => {
        try {
            const parsedData: LogbookData = JSON.parse(jsonText);
            if (!parsedData.lessonsData || !Array.isArray(parsedData.lessonsData)) {
                alert("Le JSON est invalide ou ne contient pas de clé 'lessonsData' de type tableau.");
                return;
            }
            onImport(parsedData, importMode);
        } catch (error) {
            alert('Erreur de parsing JSON. Veuillez vérifier le format.');
            console.error(error);
        }
    };

    const footer = (
        <>
            <button onClick={onClose} className="btn-secondary px-4 py-2 rounded-button text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300">Annuler</button>
            <button onClick={handleImportClick} className="btn-success px-4 py-2 rounded-button text-sm font-medium bg-success text-white hover:bg-success/90">Importer</button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Importer JSON" footer={footer}>
            <div className="flex items-center gap-2.5 mb-5">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-header-bg px-4 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-gray-200 font-medium">
                    <i className="fas fa-file-upload"></i>
                    <span>Choisir un fichier JSON</span>
                </button>
                <span className="text-text-light italic">{fileName}</span>
            </div>
            <div className="mb-5 p-4 bg-gray-100 rounded-lg border-l-4 border-primary">
                <div className="mb-2">
                    <span className="font-semibold">Mode d'importation :</span>
                </div>
                <div className="flex gap-5">
                    <label className="flex items-center cursor-pointer">
                        <input type="radio" name="importMode" value="replace" checked={importMode === 'replace'} onChange={() => setImportMode('replace')} className="mr-2 accent-primary" />
                        Remplacer le contenu actuel
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input type="radio" name="importMode" value="append" checked={importMode === 'append'} onChange={() => setImportMode('append')} className="mr-2 accent-primary" />
                        Ajouter à la suite
                    </label>
                </div>
            </div>
            <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Ou collez votre JSON ici..."
                className="w-full h-72 p-4 border border-border-color rounded-lg font-mono text-sm bg-gray-50 resize-vertical"
            ></textarea>
        </Modal>
    );
};

export default ImportModal;
