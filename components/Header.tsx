import React from 'react';
import { Settings } from '../types';

interface EditableHeaderProps {
    value: string;
    onSave: (newValue: string) => void;
}

const EditableHeader: React.FC<EditableHeaderProps> = ({ value, onSave }) => {
    const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
        const newValue = e.currentTarget.textContent || '';
        if (newValue !== value) {
            onSave(newValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };

    return (
        <span
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="inline-block min-w-[50px] border-b border-dashed border-transparent cursor-pointer transition-all ease-in-out duration-200 px-1.5 -mx-1.5 hover:border-primary hover:bg-primary/5 focus:outline-none focus:border-primary focus:bg-primary/10"
        >
            {value}
        </span>
    );
};


interface HeaderProps {
    settings: Settings;
    onSettingsChange: (newSettings: Settings) => void;
    instanceId: string;
}

const Header: React.FC<HeaderProps> = ({ settings, onSettingsChange, instanceId }) => {
    return (
        <header className="text-center mb-6 pb-4 border-b border-border-color group">
            <h1 className="text-primary text-3xl font-serif mb-2.5">
                Cahier de Textes :{' '}
                <EditableHeader
                    value={settings.teacherName}
                    onSave={(newValue) => onSettingsChange({ ...settings, teacherName: newValue })}
                />
            </h1>
            <h2 className="text-xl font-serif">
                <EditableHeader
                    value={settings.className}
                    onSave={(newValue) => onSettingsChange({ ...settings, className: newValue })}
                />
            </h2>
            <span className="block text-xs text-text-light italic mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                Cliquez sur le nom ou la classe pour modifier
            </span>
            <div className="text-sm text-text-light italic mt-1 flex items-center justify-center gap-1.5">
                <i className="fas fa-file-alt text-primary text-xs"></i> Instance: <span>{instanceId}</span>
            </div>
        </header>
    );
};

export default Header;