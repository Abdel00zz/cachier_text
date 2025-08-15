import React, { useEffect, useState } from 'react';
import { NotificationType } from '../types';

interface NotificationProps {
    message: string;
    type: NotificationType;
    onClose: () => void;
}

const iconMap = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle',
};

const colorMap = {
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-info',
    warning: 'bg-warning',
};

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            // Allow time for fade-out animation before calling onClose
            setTimeout(onClose, 300);
        }, 3200);

        return () => clearTimeout(timer);
    }, [message, type, onClose]);

    return (
        <div 
            className={`fixed bottom-5 right-5 p-3 px-4 text-white rounded-lg shadow-xl z-[1100] max-w-sm flex items-center gap-3 text-sm transition-all duration-300 ease-out print:hidden ${colorMap[type]} ${visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
        >
            <i className={`fas ${iconMap[type]} text-lg`}></i>
            <span dangerouslySetInnerHTML={{ __html: message }}></span>
        </div>
    );
};

export default Notification;