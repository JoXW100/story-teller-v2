import { useContext } from "react"
import { Context } from "components/contexts/appContext"
import TextEditorWithSyntaxHighlighting from "./textEditorWithSyntaxHighlighting"
import TextEditorSimple from "./textEditorSimple"


export type TextEditorProps = React.PropsWithRef<{
    className?: string
    text: string
    variables?: string[]
    useSyntaxEditor?: boolean
    onChange: (value: string) => void
}>


const TextEditor = ({ useSyntaxEditor, ...props }: TextEditorProps): JSX.Element =>  {
    const [app] = useContext(Context)
    const Editor = app.enableSyntaxHighlighting && (useSyntaxEditor ?? true)
        ? TextEditorWithSyntaxHighlighting
        : TextEditorSimple
    return Editor(props)
}

export default TextEditor