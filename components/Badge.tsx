import React from 'react';
import { BADGE_TEXT_MAP, BADGE_COLOR_MAP } from '../constants';

interface BadgeProps {
    type: string;
    number?: string;
}

const Badge: React.FC<BadgeProps> = ({ type, number }) => {
    const displayText = BADGE_TEXT_MAP[type] || (type.charAt(0).toUpperCase() + type.slice(1));
    const colorClass = BADGE_COLOR_MAP[type] || 'bg-gray-300';

    return (
        <span className={`inline-flex items-center justify-center rounded-button px-2.5 py-1 text-xs font-semibold text-text-color min-w-[90px] text-center shadow-sm transition-transform hover:-translate-y-px uppercase tracking-wide whitespace-nowrap border border-black/5 ${colorClass} print:bg-gray-200 print:text-black print:border-gray-400 print:shadow-none print:translate-y-0`}>
            {displayText} {number || ''}
        </span>
    );
};

export default React.memo(Badge);