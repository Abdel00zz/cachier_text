export interface Settings {
    teacherName: string;
    className: string;
}

export interface LogbookDataObject {
    lessonsData: Chapter[];
    settings: Settings;
}

export interface LogbookData {
    lessonsData: Chapter[];
    settings?: Settings;
    metadata?: any;
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface BaseElement {
    title?: string;
    description?: string;
    date?: string;
    remark?: string;
    page?: string;
    number?: string;
    type?: string;
    separatorAfter?: Separator;
}

export interface Item extends BaseElement {
    type: string;
}

export interface SubSubSection extends BaseElement {
    name: string;
    items?: Item[];
}

export interface SubSection extends BaseElement {
    name: string;
    subsubsections?: SubSubSection[];
    items?: Item[];
}

export interface Section extends BaseElement {
    name: string;
    subsections?: SubSection[];
    items?: Item[];
}

export interface Chapter {
    chapter: string;
    sections: Section[];
    date?: string;
    remark?: string;
    separatorAfter?: Separator;
}

export interface Separator {
    date: string;
    content: string;
    remark: string;
    manual: boolean;
}

export type AnyElement = Chapter | Section | SubSection | SubSubSection | Item;

export type ElementType = 'chapter' | 'section' | 'subsection' | 'subsubsection' | 'item' | 'separator';


export interface Indices {
    chapterIndex: number;
    sectionIndex?: number;
    subsectionIndex?: number;
    subsubsectionIndex?: number;
    itemIndex?: number;
    isSeparator?: boolean;
}

export interface FoundObjectResult {
  parent: AnyElement | { sections: Chapter[] } | null;
  object: AnyElement | Separator | null;
  keyInParent: 'sections' | 'subsections' | 'subsubsections' | 'items' | 'separatorAfter' | null;
  indexInParent: number;
}