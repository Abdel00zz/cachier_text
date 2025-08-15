import React from 'react';
import { Chapter, Section, SubSection, SubSubSection, Item, AnyElement, Indices, ElementType, Separator } from '../types';
import EditableCell from './EditableCell';
import Badge from './Badge';
import { TYPE_MAP } from '../constants';
import { MathJax } from 'better-react-mathjax';

interface LogbookTableProps {
    lessonsData: Chapter[];
    onCellChange: (indices: Indices, dataKey: keyof AnyElement, value: string) => void;
    onAddItem: (indices: Indices) => void;
    onDeleteItem: (indices: Indices, elementType: ElementType) => void;
    selectedIndices: Indices | null;
    onSetSelectedIndices: (indices: Indices | null) => void;
    onDeleteSeparator: (parentIndices: Indices) => void;
    onSeparatorCellChange: (parentIndices: Indices, dataKey: keyof Separator, value: string) => void;
}

const areIndicesEqual = (a: Indices | null, b: Indices | null): boolean => {
    if (!a || !b) return a === b;
    return a.chapterIndex === b.chapterIndex &&
           a.sectionIndex === b.sectionIndex &&
           a.subsectionIndex === b.subsectionIndex &&
           a.subsubsectionIndex === b.subsubsectionIndex &&
           a.itemIndex === b.itemIndex &&
           a.isSeparator === b.isSeparator;
};

const ActionButtons: React.FC<{ elementType: ElementType, indices: Indices, onAddItem: (indices: Indices) => void, onDeleteItem: (indices: Indices, elementType: ElementType) => void }> = React.memo(({ elementType, indices, onAddItem, onDeleteItem }) => {
    return (
        <div className="absolute top-1/2 right-2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity row-actions print:hidden">
            {(elementType === 'chapter' || elementType === 'section' || elementType === 'subsection' || elementType === 'subsubsection') && (
                <button
                    onClick={(e) => { e.stopPropagation(); onAddItem(indices); }}
                    title="Ajouter un élément"
                    className="action-btn bg-gray-100 text-gray-600 w-6 h-6 rounded-full text-xs flex items-center justify-center transition hover:bg-primary hover:text-white"
                >
                    <i className="fas fa-plus"></i>
                </button>
            )}
            <button
                onClick={(e) => { e.stopPropagation(); onDeleteItem(indices, elementType); }}
                title="Supprimer"
                className="action-btn bg-gray-100 text-gray-600 w-6 h-6 rounded-full text-xs flex items-center justify-center transition hover:bg-danger hover:text-white"
            >
                <i className="fas fa-trash-alt"></i>
            </button>
        </div>
    );
});


const ElementRenderer: React.FC<LogbookTableProps & { element: AnyElement, elementType: ElementType, indices: Indices }> = React.memo(({ element, elementType, indices, selectedIndices, onSetSelectedIndices, ...commonProps }) => {
    let content;
    const { onCellChange, onAddItem, onDeleteItem, onDeleteSeparator, onSeparatorCellChange } = commonProps;

    switch (elementType) {
        case 'chapter':
            const chapter = element as Chapter;
            content = <div className="text-xl font-bold text-[#e74c3c] text-center font-serif py-4 pr-16">{chapter.chapter}</div>;
            break;
        case 'section':
            const section = element as Section;
            const sectionLetter = String.fromCharCode(65 + (indices.sectionIndex ?? 0));
            content = <div className="text-lg font-semibold text-[#2c3e50] font-serif py-3 pr-16">{sectionLetter}. {section.name}</div>;
            break;
        case 'subsection':
            const subsection = element as SubSection;
            content = <div className="font-medium text-[#34495e] font-serif pl-5 py-2 pr-16">{(indices.subsectionIndex ?? 0) + 1}. {subsection.name}</div>;
            break;
        case 'subsubsection':
            const subsubsection = element as SubSubSection;
            const roman = ['i', 'ii', 'iii', 'iv', 'v'];
            const romanIndex = roman[indices.subsubsectionIndex ?? 0] || (indices.subsubsectionIndex ?? 0) + 1;
            content = <div className="font-medium italic text-[#2980b9] font-serif pl-10 py-1 pr-16">{romanIndex}. {subsubsection.name}</div>;
            break;
        case 'item':
            const item = element as Item;
            const normalizedType = TYPE_MAP[item.type?.toLowerCase() || ''] || item.type || 'élément';
            content = (
                <div className="flex flex-col sm:flex-row items-start gap-2.5 pl-14 py-2 pr-16">
                    <Badge type={normalizedType} number={item.number} />
                    <div className="flex-1 pt-0.5">
                        {item.title && <strong>{item.title}{item.description && ': '}</strong>}
                        {item.description && <span dangerouslySetInnerHTML={{ __html: item.description }} />}
                        {item.page && <span className="text-text-light italic text-sm ml-2">(p. {item.page})</span>}
                    </div>
                </div>
            );
            break;
        default:
            content = null;
    }
    
    if (!content) return null;

    const children = (element as any).sections || (element as any).subsections || (element as any).subsubsections || (element as any).items;
    
    const isSelected = areIndicesEqual(selectedIndices, indices);
    const hasDateValue = !!element.date;
    const showDateCell = elementType === 'item' || hasDateValue;

    return (
        <>
            <tr 
                className={`group relative transition-colors duration-150 cursor-pointer print:break-inside-avoid ${isSelected ? 'bg-primary/10' : 'hover:bg-primary/5'} ${hasDateValue ? 'has-date-value' : ''}`}
                onClick={() => onSetSelectedIndices(indices)}
            >
                <td className="w-[15%] text-center align-top border-r border-table-border p-2 print:text-sm">
                    {showDateCell && (
                        <EditableCell type="date" value={element.date || ''} onSave={(val) => onCellChange(indices, 'date', val)} />
                    )}
                </td>
                <td className="w-[70%] align-top relative border-r border-table-border p-0">
                    <MathJax hideUntilTypeset={"first"}>{content}</MathJax>
                    <ActionButtons elementType={elementType} indices={indices} onAddItem={onAddItem} onDeleteItem={onDeleteItem}/>
                </td>
                <td className="w-[15%] align-top p-2 print:text-sm">
                    <EditableCell type="text" value={element.remark || ''} onSave={(val) => onCellChange(indices, 'remark', val)} />
                </td>
            </tr>

            {element.separatorAfter && (
                <tr className="group relative bg-yellow-50/50 italic text-gray-700 separator-row print:bg-gray-100 print:break-inside-avoid">
                    <td className="w-[15%] text-center align-top border-r border-table-border p-2">
                        <EditableCell type="date" value={element.separatorAfter.date} onSave={val => onSeparatorCellChange(indices, 'date', val)} />
                    </td>
                    <td className="w-[70%] align-top border-r border-table-border p-2">
                         <EditableCell type="text" value={element.separatorAfter.content} onSave={val => onSeparatorCellChange(indices, 'content', val)} />
                    </td>
                    <td className="w-[15%] align-top p-2">
                        <div className="flex items-center w-full">
                           <EditableCell type="text" value={element.separatorAfter.remark} onSave={val => onSeparatorCellChange(indices, 'remark', val)} />
                           <button 
                             onClick={() => onDeleteSeparator(indices)}
                             title="Supprimer le séparateur"
                             className="action-btn text-danger ml-2 opacity-50 group-hover:opacity-100 transition-opacity print:hidden"
                           >
                               <i className="fas fa-times-circle"></i>
                           </button>
                        </div>
                    </td>
                </tr>
            )}

            {children && Array.isArray(children) && children.map((child: AnyElement, index: number) => {
                 let childElementType: ElementType = 'item';
                 let childIndices: Indices = { ...indices, itemIndex: index };

                 if ('sections' in element) { childElementType = 'section'; childIndices = { chapterIndex: indices.chapterIndex, sectionIndex: index }; }
                 else if ('subsections' in element) { childElementType = 'subsection'; childIndices = { ...indices, subsectionIndex: index }; }
                 else if ('subsubsections' in element) { childElementType = 'subsubsection'; childIndices = { ...indices, subsubsectionIndex: index }; }
                
                 return <ElementRenderer key={JSON.stringify(childIndices)} element={child} elementType={childElementType} indices={childIndices} selectedIndices={selectedIndices} onSetSelectedIndices={onSetSelectedIndices} {...commonProps} />;
            })}
        </>
    );
});

const LogbookTable: React.FC<LogbookTableProps> = (props) => {
    return (
        <table className="w-full border-collapse shadow-sm border border-table-border rounded-default overflow-hidden print:shadow-none print:border-collapse">
            <thead className="border-b-2 border-header-border">
                <tr>
                    <th className="w-[15%] bg-header-bg text-text-color font-semibold text-center sticky top-0 z-10 uppercase tracking-wider text-sm p-3 border-r border-table-border print:text-black print:font-bold">Date</th>
                    <th className="w-[70%] bg-header-bg text-text-color font-semibold text-center sticky top-0 z-10 uppercase tracking-wider text-sm p-3 border-r border-table-border print:text-black print:font-bold">Contenu</th>
                    <th className="w-[15%] bg-header-bg text-text-color font-semibold text-center sticky top-0 z-10 uppercase tracking-wider text-sm p-3 print:text-black print:font-bold">Remarque</th>
                </tr>
            </thead>
            <tbody>
                {props.lessonsData.length > 0 ? (
                    props.lessonsData.map((chapter, index) => (
                        <ElementRenderer
                            key={index}
                            element={chapter}
                            elementType="chapter"
                            indices={{ chapterIndex: index }}
                            {...props}
                        />
                    ))
                ) : (
                    <tr>
                        <td colSpan={3} className="text-center p-8 text-text-light">
                             <div className="flex flex-col items-center gap-4">
                                <i className="fas fa-book-open text-5xl opacity-50"></i>
                                <div>
                                    <p className="font-semibold">Le cahier de textes est vide.</p>
                                    <p className="text-sm mt-2">Utilisez le menu pour importer un JSON, ou commencez par ajouter un chapitre via les futures fonctionnalités.</p>
                                </div>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default LogbookTable;
