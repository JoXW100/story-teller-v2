interface DispatchAction<T> {
    type: string
    data: T
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