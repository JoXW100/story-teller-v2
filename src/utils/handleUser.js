import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';

/**
 * 
 * @returns {boolean}
 */
const useValidation = (router) => {
    const { user, isLoading } = useUser();
    
    useEffect(() => {
        if (!user && !isLoading) {
            router?.push('/login')
        }
    }, [user, isLoading])

    return user && !isLoading;
}

export {
    useValidation
}