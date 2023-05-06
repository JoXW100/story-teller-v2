import { ElementObject, Variables } from 'types/elements';

export const element: Record<string, ElementObject> = {
    'set': {
        type: 'set',
        defaultKey: null,
        inline: false,
        lineBreak: true,
        container: true,
        toComponent: null,
        validate: (_: Variables) => ({})
    }
}