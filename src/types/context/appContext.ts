import type { ContextDispatch, ContextState, ContextProvider, DispatchAction } from ".";

export enum ViewMode {
    Exclusive = "exclusive",
    SplitView = "split"
}

interface AppContextState extends ContextState {
    loading: boolean
    palette: string
    viewMode: ViewMode
    enableSyntaxHighlighting: boolean
    enableRowNumbers: boolean
    enableColorFileByType: boolean
}

interface AppContextDispatch extends ContextDispatch {
    setPalette: (palette: string) => void
    setViewMode: (mode: ViewMode) => void
    setEnableSyntaxHighlighting: (isEnabled: boolean) => void
    setEnableRowNumbers: (isEnabled: boolean) => void
    setEnableColorFileByType: (isEnabled: boolean) => void
}

type AppContextDispatchAction = DispatchAction<null, "init"> 
    | DispatchAction<string, "setPalette">
    | DispatchAction<ViewMode, "setViewMode">
    | DispatchAction<boolean, "setEnableSyntaxHighlighting">
    | DispatchAction<boolean, "setEnableRowNumbers">
    | DispatchAction<boolean, "setEnableColorFileByType">


type AppContextProvider = ContextProvider<AppContextState, AppContextDispatch>

export type {
    AppContextDispatchAction,
    AppContextProvider,
    AppContextDispatch,
    AppContextState
}