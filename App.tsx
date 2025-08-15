
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chapter, Settings, NotificationType, LogbookData, LogbookDataObject, AnyElement, Indices, ElementType, Item, Section, SubSection, SubSubSection, Separator, BaseElement } from './types';
import { useAppId } from './hooks/useAppId';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useUndoRedo } from './hooks/useUndoRedo';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import LogbookTable from './components/LogbookTable';
import ImportModal from './components/modals/ImportModal';
import DeleteChaptersModal from './components/modals/DeleteChaptersModal';
import AddItemModal from './components/modals/AddItemModal';
import GuideModal from './components/modals/GuideModal';
import ProcessLessonModal from './components/modals/ProcessLessonModal';
import Notification from './components/Notification';
import LoadingSpinner from './components/LoadingSpinner';
import { findObjectInLessonsData, getOperationName } from './services/dataService';

const App: React.FC = () => {
    const appId = useAppId();
    const { storedValue, setValue, loading } = useLocalStorage<LogbookDataObject>(`mathLessonsData_v3_${appId}`, {
        lessonsData: [],
        settings: { teacherName: "Pr. Saad", className: "2ème Bac Scientifique" }
    });

    const { state, setState, undo, redo, canUndo, canRedo, saveState: recordHistory } = useUndoRedo<LogbookDataObject>(storedValue);
    
    const [lessonsData, setLessonsData] = useState<Chapter[]>([]);
    const [settings, setSettings] = useState<Settings>({ teacherName: "Pr. Saad", className: "2ème Bac Scientifique" });

    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isDeleteChaptersModalOpen, setDeleteChaptersModalOpen] = useState(false);
    const [isAddItemModalOpen, setAddItemModalOpen] = useState(false);
    const [isGuideModalOpen, setGuideModalOpen] = useState(false);
    const [isProcessLessonModalOpen, setProcessLessonModalOpen] = useState(false);
    const [addItemContext, setAddItemContext] = useState<Indices | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndices, setSelectedIndices] = useState<Indices | null>(null);


    useEffect(() => {
        if (!loading) {
            setState(storedValue, 'initial', true);
            setLessonsData(storedValue.lessonsData);
            setSettings(storedValue.settings);
            setIsLoading(false);
        }
    }, [loading, storedValue, setState]);

    const showNotification = useCallback((message: string, type: NotificationType, duration = 3500) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), duration);
    }, []);

    const handleSave = useCallback((dataToSave: LogbookDataObject, operationType: string) => {
        recordHistory(dataToSave, operationType);
        setValue(dataToSave);
        setIsSaving(true);
        setHasUnsavedChanges(false);
        setTimeout(() => setIsSaving(false), 500);
    }, [recordHistory, setValue]);

    const performAction = useCallback((action: (currentData: LogbookDataObject) => LogbookDataObject, operationType: string, notificationMessage?: string) => {
        const currentData: LogbookDataObject = { lessonsData, settings };
        const newData = action(currentData);
        setLessonsData(newData.lessonsData);
        setSettings(newData.settings);
        handleSave(newData, operationType);
        if (notificationMessage) {
            showNotification(notificationMessage, 'success');
        }
        setSelectedIndices(null);
    }, [lessonsData, settings, handleSave, showNotification]);

    const handleUndo = useCallback(() => {
        if (canUndo) {
            const prevState = undo();
            setLessonsData(prevState.data.lessonsData);
            setSettings(prevState.data.settings);
            setValue(prevState.data);
            showNotification(`Annulé: ${getOperationName(prevState.operationType)}.`, 'success');
        }
    }, [canUndo, undo, setValue, showNotification]);

    const handleRedo = useCallback(() => {
        if (canRedo) {
            const nextState = redo();
            setLessonsData(nextState.data.lessonsData);
            setSettings(nextState.data.settings);
            setValue(nextState.data);
            showNotification(`Rétabli: ${getOperationName(nextState.operationType)}.`, 'success');
        }
    }, [canRedo, redo, setValue, showNotification]);

    const handleManualSave = useCallback(() => {
        handleSave({ lessonsData, settings }, 'manual-save');
        showNotification('Sauvegarde manuelle effectuée.', 'success');
    }, [lessonsData, settings, handleSave, showNotification]);

    const handleSettingsChange = (newSettings: Settings) => {
        performAction(currentData => ({ ...currentData, settings: newSettings }), 'settings-change');
    };

    const handleCellChange = useCallback((indices: Indices, dataKey: keyof AnyElement, value: string) => {
        performAction(currentData => {
            const newData = JSON.parse(JSON.stringify(currentData.lessonsData));
            const { object } = findObjectInLessonsData(newData, indices);
            if (object) {
                (object as any)[dataKey] = value;
            }
            return { ...currentData, lessonsData: newData };
        }, 'cell-edit');
    }, [performAction]);

    const handleImport = (importedData: LogbookData, mode: 'replace' | 'append') => {
        performAction(currentData => {
            const newData = mode === 'replace' ? importedData.lessonsData : [...currentData.lessonsData, ...importedData.lessonsData];
            const newSettings = importedData.settings || currentData.settings;
            return { lessonsData: newData, settings: newSettings };
        }, 'import', 'Données importées avec succès!');
        setImportModalOpen(false);
    };

    const handleExport = useCallback(() => {
        try {
            const dataToExport: LogbookDataObject = {
                lessonsData,
                settings,
            };
            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const dateStr = new Date().toISOString().slice(0, 10);
            a.href = url;
            a.download = `cahier_de_textes_${appId}_${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showNotification('Données exportées avec succès !', 'success');
        } catch (error) {
            console.error("Erreur lors de l'exportation JSON:", error);
            showNotification("Échec de l'exportation.", 'error');
        }
    }, [lessonsData, settings, appId, showNotification]);
    
    const handleDeleteChapters = (indicesToDelete: number[]) => {
         performAction(currentData => {
            const newData = currentData.lessonsData.filter((_, index) => !indicesToDelete.includes(index));
            return { ...currentData, lessonsData: newData };
        }, 'chapter-delete', `${indicesToDelete.length} chapitre(s) supprimé(s).`);
        setDeleteChaptersModalOpen(false);
    };

    const handleAddItem = (newItem: AnyElement) => {
        if (!addItemContext) return;
        performAction(currentData => {
            const newData = JSON.parse(JSON.stringify(currentData.lessonsData));
            const { object } = findObjectInLessonsData(newData, addItemContext);
            if (object) {
                const target = object as any;
                const itemsKey: keyof typeof target = target.items ? 'items' : (target.subsections ? 'items' : 'sections');
                 if (!target[itemsKey]) {
                    target[itemsKey] = [];
                }
                target[itemsKey].push(newItem);
            }
            return { ...currentData, lessonsData: newData };
        }, 'item-add', 'Nouvel élément ajouté !');
        setAddItemModalOpen(false);
    };

    const handleDeleteItem = useCallback((indices: Indices, elementType: ElementType) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer cet élément (${elementType}) et tout son contenu ?`)) return;

        performAction(currentData => {
            const newData = JSON.parse(JSON.stringify(currentData.lessonsData));
            const { parent, keyInParent, indexInParent } = findObjectInLessonsData(newData, indices);
             if (parent && keyInParent && Array.isArray((parent as any)[keyInParent]) && indexInParent > -1) {
                (parent as any)[keyInParent].splice(indexInParent, 1);
            }
            return { ...currentData, lessonsData: newData };
        }, 'item-delete', 'Élément supprimé.');
    }, [performAction]);

    const openAddItemModal = useCallback((indices: Indices) => {
        setAddItemContext(indices);
        setAddItemModalOpen(true);
    }, []);

    const handleAddSeparator = useCallback(() => {
        if (!selectedIndices) {
            showNotification("Cliquez d'abord sur une ligne pour indiquer où insérer.", 'warning');
            return;
        }
        performAction(currentData => {
            const newData = JSON.parse(JSON.stringify(currentData.lessonsData));
            const { object } = findObjectInLessonsData(newData, selectedIndices);
            if (object && !('separatorAfter' in object)) {
                (object as BaseElement).separatorAfter = { date: object.date || '', content: '--- Séparateur Manuel ---', remark: '', manual: true };
            } else {
                showNotification("Un séparateur existe déjà à cet endroit.", "info");
            }
            return { ...currentData, lessonsData: newData };
        }, 'separator-add', 'Séparateur ajouté.');
    }, [performAction, selectedIndices, showNotification]);

    const handleDeleteSeparator = useCallback((parentIndices: Indices) => {
        performAction(currentData => {
            const newData = JSON.parse(JSON.stringify(currentData.lessonsData));
            const { object: parentObject } = findObjectInLessonsData(newData, parentIndices);
            if (parentObject && 'separatorAfter' in parentObject) {
                delete (parentObject as BaseElement).separatorAfter;
            }
            return { ...currentData, lessonsData: newData };
        }, 'separator-delete', 'Séparateur supprimé.');
    }, [performAction]);
    
    const handleProcessLesson = (processedChapters: Chapter[]) => {
        performAction(currentData => {
            // Replace current data with the processed lesson, but keep settings
            return { lessonsData: processedChapters, settings: currentData.settings };
        }, 'ai-process', 'Leçon traitée et chargée avec succès !');
        setProcessLessonModalOpen(false);
    };

    const handleCellChangeForSeparator = useCallback((parentIndices: Indices, dataKey: keyof Separator, value: string) => {
        performAction(currentData => {
            const newData = JSON.parse(JSON.stringify(currentData.lessonsData));
            const { object: parentObject } = findObjectInLessonsData(newData, parentIndices);
            if (parentObject && 'separatorAfter' in parentObject && (parentObject as BaseElement).separatorAfter) {
                ((parentObject as BaseElement).separatorAfter as any)[dataKey] = value;
            }
            return { ...currentData, lessonsData: newData };
        }, 'cell-edit-separator');
    }, [performAction]);

    const filteredLessonsData = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            return lessonsData;
        }
    
        const checkMatch = (element: any): boolean => {
            if (!element) return false;
            return ['chapter', 'name', 'title', 'description', 'remark', 'date', 'page', 'number', 'type']
                .some(key => typeof element[key] === 'string' && element[key].toLowerCase().includes(query));
        };
    
        const filterRecursively = (elements: AnyElement[]): AnyElement[] => {
            return elements.map(element => {
                const isMatch = checkMatch(element);
    
                const childrenKeys: ('sections' | 'subsections' | 'subsubsections' | 'items')[] = ['sections', 'subsections', 'subsubsections', 'items'];
                let filteredChildren: { [key: string]: AnyElement[] } = {};
                let hasMatchingChildren = false;
    
                for (const key of childrenKeys) {
                    if (key in element && Array.isArray((element as any)[key])) {
                        const filtered = filterRecursively((element as any)[key]);
                        if (filtered.length > 0) {
                            hasMatchingChildren = true;
                        }
                        filteredChildren[key] = filtered;
                    }
                }
    
                if (isMatch) {
                    // Parent matches, return it with all its original children.
                    return element;
                }
    
                if (hasMatchingChildren) {
                    // Parent doesn't match, but children do. Return parent with only filtered children.
                    const newElement = { ...element };
                    for (const key in filteredChildren) {
                        (newElement as any)[key] = filteredChildren[key];
                    }
                    return newElement;
                }
                
                return null;
    
            }).filter((e): e is AnyElement => e !== null);
        };
    
        return filterRecursively(lessonsData) as Chapter[];
    }, [searchQuery, lessonsData]);


    if (isLoading) {
        return <LoadingSpinner text="Chargement du cahier de textes..." />;
    }

    return (
        <div className="max-w-7xl mx-auto bg-container-color shadow-lg rounded-default p-5 min-h-[calc(100vh-40px)] flex flex-col print:shadow-none print:p-0 print:border-none">
            <Header settings={settings} onSettingsChange={handleSettingsChange} instanceId={appId} />
            
            <Toolbar 
                onUndo={handleUndo} 
                canUndo={canUndo}
                onRedo={handleRedo}
                canRedo={canRedo}
                onManualSave={handleManualSave}
                onImport={() => setImportModalOpen(true)}
                onExport={handleExport}
                onDeleteChapters={() => setDeleteChaptersModalOpen(true)}
                onPrint={() => window.print()}
                onShowGuide={() => setGuideModalOpen(true)}
                onProcessLesson={() => setProcessLessonModalOpen(true)}
                isSaving={isSaving}
                hasUnsavedChanges={hasUnsavedChanges}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddSeparator={handleAddSeparator}
                isSeparatorActionEnabled={!!selectedIndices}
            />

            <main className="flex-1 overflow-auto main-content">
                <LogbookTable 
                    lessonsData={filteredLessonsData}
                    onCellChange={handleCellChange}
                    onAddItem={openAddItemModal}
                    onDeleteItem={handleDeleteItem}
                    selectedIndices={selectedIndices}
                    onSetSelectedIndices={setSelectedIndices}
                    onDeleteSeparator={handleDeleteSeparator}
                    onSeparatorCellChange={handleCellChangeForSeparator}
                />
            </main>

            {isImportModalOpen && (
                <ImportModal 
                    isOpen={isImportModalOpen} 
                    onClose={() => setImportModalOpen(false)}
                    onImport={handleImport}
                />
            )}
            {isDeleteChaptersModalOpen && (
                <DeleteChaptersModal
                    isOpen={isDeleteChaptersModalOpen}
                    onClose={() => setDeleteChaptersModalOpen(false)}
                    chapters={lessonsData}
                    onConfirmDelete={handleDeleteChapters}
                />
            )}
             {isAddItemModalOpen && addItemContext && (
                <AddItemModal
                    isOpen={isAddItemModalOpen}
                    onClose={() => setAddItemModalOpen(false)}
                    onConfirmAdd={handleAddItem}
                    contextIndices={addItemContext}
                    lessonsData={lessonsData}
                />
            )}
            {isGuideModalOpen && (
                <GuideModal
                    isOpen={isGuideModalOpen}
                    onClose={() => setGuideModalOpen(false)}
                />
            )}
            {isProcessLessonModalOpen && (
                <ProcessLessonModal
                    isOpen={isProcessLessonModalOpen}
                    onClose={() => setProcessLessonModalOpen(false)}
                    onProcessComplete={handleProcessLesson}
                    showNotification={showNotification}
                />
            )}

            {notification && (
                <Notification 
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default App;
