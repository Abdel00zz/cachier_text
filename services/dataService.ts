
import { Chapter, Indices, FoundObjectResult, AnyElement, Separator } from '../types';

export const findObjectInLessonsData = (data: Chapter[], indices: Indices): FoundObjectResult => {
    try {
        if (indices.chapterIndex === undefined || !data[indices.chapterIndex]) return { parent: null, object: null, keyInParent: null, indexInParent: -1 };
        
        let parent: AnyElement | { sections: Chapter[] } = { sections: data };
        let object: AnyElement | Separator | null = data[indices.chapterIndex];
        let keyInParent: FoundObjectResult['keyInParent'] = 'sections';
        let indexInParent = indices.chapterIndex;

        if (indices.sectionIndex !== undefined) {
            parent = object as AnyElement; keyInParent = 'sections'; indexInParent = indices.sectionIndex;
            object = (object as Chapter).sections?.[indices.sectionIndex] || null;
        }
        if (object && indices.subsectionIndex !== undefined) {
            parent = object as AnyElement; keyInParent = 'subsections'; indexInParent = indices.subsectionIndex;
            object = (object as any).subsections?.[indices.subsectionIndex] || null;
        }
        if (object && indices.subsubsectionIndex !== undefined) {
            parent = object as AnyElement; keyInParent = 'subsubsections'; indexInParent = indices.subsubsectionIndex;
            object = (object as any).subsubsections?.[indices.subsubsectionIndex] || null;
        }
        if (object && indices.itemIndex !== undefined) {
            parent = object as AnyElement; keyInParent = 'items'; indexInParent = indices.itemIndex;
            object = (object as any).items?.[indices.itemIndex] || null;
        }
        
        if (indices.isSeparator) {
            let precedingItemIndices = { ...indices };
            delete precedingItemIndices.isSeparator;
            const { object: precedingObject } = findObjectInLessonsData(data, precedingItemIndices);
            
            if (precedingObject && 'separatorAfter' in precedingObject) {
                return {
                    parent: precedingObject,
                    object: precedingObject.separatorAfter || null,
                    keyInParent: 'separatorAfter',
                    indexInParent: -1
                };
            }
        }

        return { parent, object, keyInParent, indexInParent };
    } catch (e) {
        console.error("Error in findObjectInLessonsData:", e, "with indices:", indices);
        return { parent: null, object: null, keyInParent: null, indexInParent: -1 };
    }
};

export const getOperationName = (opType?: string) => {
    if (!opType) return 'Modification';
    const names: { [key: string]: string } = {
        'generic': 'Modification', 'cell-edit': 'Édition de cellule', 'item-add': 'Ajout d\'élément', 'item-delete': 'Suppression d\'élément',
        'separator-add': 'Ajout de séparateur', 'separator-delete': 'Suppression de séparateur',
        'chapter-delete': 'Suppression de chapitre', 'import': 'Importation', 'initial': 'État initial',
        'settings-change': 'Changement de paramètres', 'manual-save': 'Sauvegarde manuelle'
    };
    return names[opType] || opType.charAt(0).toUpperCase() + opType.slice(1);
};
