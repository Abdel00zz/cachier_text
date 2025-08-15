import React from 'react';
import MainMenu from './MainMenu';

interface ToolbarProps {
    onUndo: () => void;
    canUndo: boolean;
    onRedo: () => void;
    canRedo: boolean;
    onManualSave: () => void;
    onImport: () => void;
    onExport: () => void;
    onDeleteChapters: () => void;
    onPrint: () => void;
    onShowGuide: () => void;
    onProcessLesson: () => void;
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddSeparator: () => void;
    isSeparatorActionEnabled: boolean;
}

const SaveStatus: React.FC<{ isSaving: boolean; hasUnsavedChanges: boolean }> = React.memo(({ isSaving, hasUnsavedChanges }) => {
    let status: 'saved' | 'saving' | 'unsaved' = 'saved';
    if (isSaving) status = 'saving';
    else if (hasUnsavedChanges) status = 'unsaved';

    const statusConfig = {
        saved: { icon: 'fa-check-circle', text: 'Sauvegardé', color: 'text-success' },
        saving: { icon: 'fa-sync-alt fa-spin', text: 'Sauvegarde...', color: 'text-info' },
        unsaved: { icon: 'fa-exclamation-circle', text: 'Non sauvegardé', color: 'text-warning' },
    };

    const current = statusConfig[status];

    return (
        <div className={`flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md bg-header-bg transition-all duration-300 min-w-[120px] justify-center ${current.color}`}>
            <i className={`fas ${current.icon}`}></i>
            <span>{current.text}</span>
        </div>
    );
});

const ToolbarButton: React.FC<{ onClick: () => void; disabled?: boolean; icon: string; tooltip: string }> = React.memo(({ onClick, disabled, icon, tooltip }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={tooltip}
        className="bg-header-bg text-text-color w-10 h-10 p-0 rounded-full shadow-md flex items-center justify-center transition-all hover:bg-gray-200 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-header-bg disabled:hover:text-text-color"
    >
        <i className={`fas ${icon} text-base`}></i>
    </button>
));


const Toolbar: React.FC<ToolbarProps> = (props) => {
    return (
        <div className="flex justify-between items-center mb-5 p-3 bg-header-bg/80 backdrop-blur-md rounded-default shadow-sm border border-border-color sticky top-2.5 z-50 flex-wrap gap-2.5 print:hidden">
            <div className="flex gap-2.5 items-center flex-wrap">
                 <ToolbarButton onClick={props.onAddSeparator} disabled={!props.isSeparatorActionEnabled} icon="fa-grip-lines" tooltip="Insérer un séparateur (sélectionner une ligne d'abord)" />
                <SaveStatus isSaving={props.isSaving} hasUnsavedChanges={props.hasUnsavedChanges} />
            </div>

            <div className="flex gap-2.5 items-center justify-center flex-grow flex-wrap">
                <ToolbarButton onClick={props.onUndo} disabled={!props.canUndo} icon="fa-undo" tooltip="Annuler (Ctrl+Z)" />
                <ToolbarButton onClick={props.onRedo} disabled={!props.canRedo} icon="fa-redo" tooltip="Rétablir (Ctrl+Y)" />
                <ToolbarButton onClick={props.onManualSave} icon="fa-save" tooltip="Sauvegarde manuelle" />
            </div>

            <div className="flex gap-2.5 items-center flex-wrap">
                <MainMenu {...props} />
            </div>
        </div>
    );
};

export default Toolbar;