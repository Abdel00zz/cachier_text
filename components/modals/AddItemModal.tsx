import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import { AnyElement, Indices, Chapter, Item } from '../../types';
import { TYPE_MAP } from '../../constants';
import { findObjectInLessonsData } from '../../services/dataService';

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmAdd: (item: AnyElement) => void;
    contextIndices: Indices;
    lessonsData: Chapter[];
}

const FormGroup: React.FC<{label: string, children: React.ReactNode, fullWidth?: boolean}> = ({ label, children, fullWidth }) => (
    <div className={`flex flex-col ${fullWidth ? 'col-span-2' : ''}`}>
        <label className="mb-2 font-medium text-sm">{label}</label>
        {children}
    </div>
);

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onConfirmAdd, contextIndices, lessonsData }) => {
    const [formData, setFormData] = useState<Partial<Item>>({ type: '' });

    const itemTypes = useMemo(() => [...new Set(Object.values(TYPE_MAP))].sort((a, b) => a.localeCompare(b)), []);
    
    const contextObject = useMemo(() => {
        const { object } = findObjectInLessonsData(lessonsData, contextIndices);
        return object;
    }, [lessonsData, contextIndices]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.type) {
            alert("Le type d'élément est obligatoire.");
            return;
        }
        onConfirmAdd(formData as Item);
        setFormData({ type: '' }); // Reset form
    };
    
    const getModalTitle = () => {
        let title = "Ajouter un élément";
        if (contextObject) {
            if ('name' in contextObject && contextObject.name) title += ` dans "${contextObject.name}"`;
            else if ('chapter' in contextObject && contextObject.chapter) title += ` dans "${contextObject.chapter}"`;
        }
        return title;
    };

    const footer = (
         <>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-button text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300">Annuler</button>
            <button type="submit" form="add-item-form" className="px-4 py-2 rounded-button text-sm font-medium bg-success text-white hover:bg-success/90">Ajouter l'élément</button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()} footer={footer} maxWidth="max-w-xl">
            <form id="add-item-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-5 gap-y-4">
                <FormGroup label="Type d'élément">
                    <select name="type" value={formData.type || ''} onChange={handleChange} required className="w-full p-2.5 border rounded-md border-border-color bg-gray-50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                        <option value="" disabled>Choisir un type...</option>
                        {itemTypes.map(type => (
                            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                    </select>
                </FormGroup>
                <FormGroup label="Numéro (Ex: 1.1)">
                    <input type="text" name="number" value={formData.number || ''} onChange={handleChange} placeholder="Optionnel" className="w-full p-2.5 border rounded-md border-border-color bg-gray-50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"/>
                </FormGroup>
                <FormGroup label="Titre" fullWidth>
                    <input type="text" name="title" value={formData.title || ''} onChange={handleChange} placeholder="Titre de l'élément" className="w-full p-2.5 border rounded-md border-border-color bg-gray-50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"/>
                </FormGroup>
                <FormGroup label="Description / Contenu" fullWidth>
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Description, formule, énoncé..." rows={3} className="w-full p-2.5 border rounded-md border-border-color bg-gray-50 resize-vertical focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
                </FormGroup>
                 <FormGroup label="Page">
                    <input type="text" name="page" value={formData.page || ''} onChange={handleChange} placeholder="p. 42" className="w-full p-2.5 border rounded-md border-border-color bg-gray-50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"/>
                </FormGroup>
                 <FormGroup label="Date">
                    <input type="date" name="date" value={formData.date || ''} onChange={handleChange} className="w-full p-2.5 border rounded-md border-border-color bg-gray-50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"/>
                </FormGroup>
                 <FormGroup label="Remarque" fullWidth>
                    <input type="text" name="remark" value={formData.remark || ''} onChange={handleChange} placeholder="Remarque pour cette entrée" className="w-full p-2.5 border rounded-md border-border-color bg-gray-50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"/>
                </FormGroup>
            </form>
        </Modal>
    );
};

export default AddItemModal;