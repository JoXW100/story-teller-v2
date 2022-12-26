import type { ContextDispatch, ContextState, ContextProvider } from ".";

interface AppContextState extends ContextState {
    loading: boolean
    palette: string
}

interface AppContextDispatch extends ContextDispatch {
    setPalette: (palette: string) => void
}


type AppContextProvider = ContextProvider<AppContextState, AppContextDispatch>

export type {
    AppContextProvider,
    AppContextDispatch,
    AppContextState
}