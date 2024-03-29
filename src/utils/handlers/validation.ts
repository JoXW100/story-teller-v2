import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0';
import Navigation from 'utils/navigation';
import Communication, { ServerMode } from 'utils/communication';

type ValidationState = {
    mode: ServerMode,
    loading: boolean
}

export const useValidation = (): boolean => {
    const router = useRouter();
    const context = useUser();
    const [state, setState] = useState<ValidationState>({
        mode: null,
        loading: true
    });

    useEffect(() => {
        Communication.getServerMode()
        .then(mode => setState((state) => ({ ...state, loading: false, mode: mode })))
    }, [router.pathname])

    useEffect(() => {
        if (!context.user && !context.isLoading) {
            router.push(Navigation.loginURL(location.pathname))
        } else if (!state.loading && state.mode === "maintenance") {
            router.push(Navigation.maintenanceURL())
        }
    }, [context.user, context.isLoading, state.loading, state.mode])

    return !context.isLoading && !state.loading && context.user !== null;
}