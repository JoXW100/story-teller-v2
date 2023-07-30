import StoryPage from 'components/storyPage'
import StoryContext from 'components/contexts/storyContext'
import { useValidation } from 'utils/handlers/validation'

type LoginPageProps = {
    storyId: string,
    fileId: [string]
    edit?: string
}

const Page = ({ props }: { props: LoginPageProps }): JSX.Element => {
    const fileId = props.fileId?.find(() => true)
    const valid = useValidation();
    
    return valid && (
        <StoryContext 
            editMode={props.edit === 'true'}
            storyId={props.storyId} 
            fileId={fileId}
            viewMode={false}
        >
            <StoryPage/>
        </StoryContext>
    )
}

export default Page;