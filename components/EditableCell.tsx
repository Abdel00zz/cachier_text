import React, { useState, useEffect, useRef } from 'react';

interface EditableCellProps {
    value: string;
    onSave: (newValue: string) => void;
    type: 'text' | 'date';
}

const formatDateForDisplay = (dateString: string): string => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return '';
    }
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

const isValidDate = (y: string, m: string, d: string): boolean => {
    const year = parseInt(y, 10);
    const month = parseInt(m, 10);
    const day = parseInt(d, 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
    
    // Use UTC to avoid timezone issues during validation
    const testDate = new Date(Date.UTC(year, month - 1, day));
    
    return (
        !isNaN(testDate.getTime()) &&
        testDate.getUTCFullYear() === year &&
        testDate.getUTCMonth() === month - 1 &&
        testDate.getUTCDate() === day
    );
};

const EditableCell: React.FC<EditableCellProps> = ({ value, onSave, type }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    // For date type
    const dateContainerRef = useRef<HTMLDivElement>(null);
    const dayRef = useRef<HTMLInputElement>(null);
    const monthRef = useRef<HTMLInputElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);

    // For text type
    const textDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isEditing && type === 'date') {
            const [y, m, d] = value ? value.split('-') : ['', '', ''];
            if (dayRef.current) dayRef.current.value = d;
            if (monthRef.current) monthRef.current.value = m;
            if (yearRef.current) yearRef.current.value = y;
            dayRef.current?.focus();
            dayRef.current?.select();
        }
    }, [isEditing, type, value]);

    useEffect(() => {
        if (type === 'text' && textDivRef.current && textDivRef.current.innerHTML !== value) {
            textDivRef.current.innerHTML = value;
        }
    }, [value, type]);

    const handleDateSave = () => {
        const d = dayRef.current?.value.trim() || '';
        const m = monthRef.current?.value.trim() || '';
        const y = yearRef.current?.value.trim() || '';

        if (!d && !m && !y) {
            if (value) onSave('');
            return;
        }

        if (isValidDate(y, m, d)) {
            const newDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            if (newDate !== value) {
                onSave(newDate);
            }
        }
    };

    const handleDateBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (dateContainerRef.current?.contains(e.relatedTarget as Node)) {
            return;
        }
        handleDateSave();
        setIsEditing(false);
    };

    const handleDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleDateSave();
            setIsEditing(false);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsEditing(false);
        }
    };
    
    const handleDatePartChange = (e: React.ChangeEvent<HTMLInputElement>, part: 'day' | 'month' | 'year') => {
        const { value, maxLength } = e.target;
        if (value.length >= maxLength) {
            if (part === 'day') monthRef.current?.focus();
            if (part === 'month') yearRef.current?.focus();
        }
    };

    const handleTextBlur = () => {
        if (textDivRef.current && textDivRef.current.innerHTML !== value) {
            onSave(textDivRef.current.innerHTML);
        }
    };

    const handleTextKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            (e.target as HTMLElement).blur();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            if (textDivRef.current) {
                textDivRef.current.innerHTML = value; // Revert changes
            }
            (e.target as HTMLElement).blur();
        }
    };

    if (type === 'date') {
        if (isEditing) {
            return (
                <div
                    ref={dateContainerRef}
                    onBlur={handleDateBlur}
                    className="flex items-center justify-center gap-1 p-0.5"
                >
                    <input
                        ref={dayRef}
                        type="text"
                        maxLength={2}
                        placeholder="JJ"
                        onKeyDown={handleDateKeyDown}
                        onChange={(e) => handleDatePartChange(e, 'day')}
                        className="w-8 text-center bg-white border border-border-color rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-gray-400">/</span>
                    <input
                        ref={monthRef}
                        type="text"
                        maxLength={2}
                        placeholder="MM"
                        onKeyDown={handleDateKeyDown}
                        onChange={(e) => handleDatePartChange(e, 'month')}
                        className="w-8 text-center bg-white border border-border-color rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-gray-400">/</span>
                    <input
                        ref={yearRef}
                        type="text"
                        maxLength={4}
                        placeholder="AAAA"
                        onKeyDown={handleDateKeyDown}
                        onChange={(e) => handleDatePartChange(e, 'year')}
                        className="w-12 text-center bg-white border border-border-color rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            );
        }

        return (
            <div
                onClick={() => setIsEditing(true)}
                className="min-h-[20px] w-full text-center transition-colors duration-200 cursor-pointer px-2 py-1 rounded hover:bg-primary/5 print:hover:bg-transparent"
                title="Cliquez pour modifier la date"
            >
                {formatDateForDisplay(value) || <span className="text-text-light/50 italic">--/--/----</span>}
            </div>
        );
    }
    
    // For text type:
    return (
        <div
            ref={textDivRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTextBlur}
            onKeyDown={handleTextKeyDown}
            className="min-h-[20px] w-full transition-colors duration-200 cursor-text px-2 py-1 rounded hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
        />
    );
};

export default React.memo(EditableCell);