interface DispatchAction<D, T extends string = string> {
    type: T
    data: D
}

interface ContextState {

}

interface ContextDispatch {

}

type ContextProvider<A extends ContextState, B extends ContextDispatch> = [
    data: A, dispatch: B
]

export type {
    DispatchAction,
    ContextState,
    ContextDispatch,
    ContextProvider
}