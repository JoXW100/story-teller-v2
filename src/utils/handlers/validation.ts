import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0';

export const useValidation = (): boolean => {
    const router = useRouter();
    const context = useUser();

    if (!context.user && !context.isLoading) {
        router.push(`/login?return=${location.pathname}`)
    }

    return context.user && !context.isLoading;
}