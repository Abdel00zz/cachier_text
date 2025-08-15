import React, { useState, useEffect, useRef } from 'react';

interface MainMenuProps {
    onImport: () => void;
    onExport: () => void;
    onDeleteChapters: () => void;
    onPrint: () => void;
    onShowGuide: () => void;
    onProcessLesson: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const MenuItem: React.FC<{ onClick: () => void; icon: string; label: string; }> = ({ onClick, icon, label }) => (
    <button onClick={onClick} className="flex items-center gap-2.5 p-2.5 w-full text-left text-sm text-text-color transition-colors duration-150 hover:bg-header-bg">
        <i className={`fas ${icon} w-4 text-center text-text-light`}></i>
        <span>{label}</span>
    </button>
);

const MainMenu: React.FC<MainMenuProps> = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleItemClick = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                title="Plus d'actions"
                className="bg-header-bg text-text-color w-10 h-10 p-0 rounded-full shadow-md flex items-center justify-center transition-all hover:bg-gray-200 hover:text-primary"
            >
                <i className="fas fa-ellipsis-v text-base"></i>
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-container-color rounded-default shadow-lg border border-border-color z-50 py-2 overflow-hidden animate-fadeInMenu">
                    <div className="px-3 py-2">
                        <div className="relative w-full">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-light text-sm"></i>
                            <input
                                type="search"
                                value={props.searchQuery}
                                onChange={(e) => props.onSearchChange(e.target.value)}
                                placeholder="Rechercher..."
                                className="w-full pl-8 pr-3 py-1.5 rounded-full border border-border-color bg-white transition-all text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>
                    <div className="h-px bg-border-color my-2"></div>
                    <MenuItem onClick={() => handleItemClick(props.onProcessLesson)} icon="fa-wand-magic-sparkles" label="Traiter ma leçon" />
                    <MenuItem onClick={() => handleItemClick(props.onImport)} icon="fa-file-import" label="Importer JSON" />
                    <MenuItem onClick={() => handleItemClick(props.onExport)} icon="fa-file-export" label="Exporter JSON" />
                    <MenuItem onClick={() => handleItemClick(props.onDeleteChapters)} icon="fa-trash-alt" label="Supprimer chapitres" />
                    <div className="h-px bg-border-color my-2"></div>
                    <MenuItem onClick={() => handleItemClick(props.onPrint)} icon="fa-print" label="Imprimer" />
                    <div className="h-px bg-border-color my-2"></div>
                    <MenuItem onClick={() => handleItemClick(props.onShowGuide)} icon="fa-question-circle" label="Guide" />
                </div>
            )}
        </div>
    );
};

export default MainMenu;