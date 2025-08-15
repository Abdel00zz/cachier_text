
import { useState, useEffect } from 'react';

export const useAppId = (): string => {
    const [appId, setAppId] = useState('default');

    useEffect(() => {
        const pathParts = window.location.pathname.split('/');
        let fileName = pathParts[pathParts.length - 1].split('.')[0] || 'default';
        
        const urlParams = new URLSearchParams(window.location.search);
        const idParam = urlParams.get('id');
        
        const finalId = idParam || fileName || 'default';
        setAppId(finalId);
    }, []);

    return appId;
};
