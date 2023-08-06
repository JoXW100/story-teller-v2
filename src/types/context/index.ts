interface DispatchAction<T extends string, D, A> {
    type: T
    data: D
    dispatch?: React.Dispatch<A>
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