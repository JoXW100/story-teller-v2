import type { ContextDispatch, ContextState, ContextProvider } from ".";

export enum ViewMode {
    Exclusive = "exclusive",
    SplitView = "split"
}

interface AppContextState extends ContextState {
    loading: boolean
    palette: string
    viewMode: ViewMode
}

interface AppContextDispatch extends ContextDispatch {
    setPalette: (palette: string) => void
    setViewMode: (mode: ViewMode) => void
}


type AppContextProvider = ContextProvider<AppContextState, AppContextDispatch>

export type {
    AppContextProvider,
    AppContextDispatch,
    AppContextState
}