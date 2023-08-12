import { IElementObject, Variables } from 'types/elements';

export const element = {
    set: {
        type: 'set',
        defaultKey: null,
        buildChildren: false,
        validOptions: null,
        toComponent: null,
        validate: () => ({})
    }
} satisfies Record<string, IElementObject>