import type { ContextDispatch, ContextState, ContextProvider, DispatchAction } from ".";

export enum ViewMode {
    SplitView = "split",
    Exclusive = "exclusive"
}

interface AppContextState extends ContextState {
    loading: boolean
    palette: string
    viewMode: ViewMode
    enableSyntaxHighlighting: boolean
    enableRowNumbers: boolean
    enableColorFileByType: boolean
    automaticLineBreak: number
}

interface AppContextDispatch extends ContextDispatch {
    setPalette: (palette: string) => void
    setViewMode: (mode: ViewMode) => void
    setEnableSyntaxHighlighting: (isEnabled: boolean) => void
    setEnableRowNumbers: (isEnabled: boolean) => void
    setEnableColorFileByType: (isEnabled: boolean) => void
    setAutomaticLineBreak: (count: number) => void
    clearCommunicationCache: () => void
}

type AppContextDispatchAction = 
      DispatchAction<"init", null, AppContextDispatchAction> 
    | DispatchAction<"setPalette", string, AppContextDispatchAction>
    | DispatchAction<"setViewMode", ViewMode, AppContextDispatchAction>
    | DispatchAction<"setEnableSyntaxHighlighting", boolean, AppContextDispatchAction>
    | DispatchAction<"setEnableRowNumbers", boolean, AppContextDispatchAction>
    | DispatchAction<"setEnableColorFileByType", boolean, AppContextDispatchAction>
    | DispatchAction<"setAutomaticLineBreak", number, AppContextDispatchAction>


type AppContextProvider = ContextProvider<AppContextState, AppContextDispatch>

export type {
    AppContextDispatchAction,
    AppContextProvider,
    AppContextDispatch,
    AppContextState
}