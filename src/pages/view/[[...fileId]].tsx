import ViewPage from 'components/viewPage'
import FileContext from 'components/contexts/fileContext'
import StoryContext from 'components/contexts/storyContext'
import { useValidation } from 'utils/handlers/handleUser'

type LoginPageProps = {
    fileId: [string]
}

const Page = ({ props }: { props: LoginPageProps }): JSX.Element => {
    const fileId = props.fileId?.find(() => true)
    const valid = useValidation();
    
    return valid && (
        <StoryContext viewMode={true} storyId={null} fileId={fileId} editMode={false}>
            <FileContext fileId={fileId}>
                <ViewPage/>
            </FileContext>
        </StoryContext>
    )
}

export default Page;