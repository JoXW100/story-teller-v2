import StoryPage from 'components/storyPage'
import StoryContext from 'components/contexts/storyContext'
import { useValidation } from 'utils/handlers/validation'
import { isObjectId } from 'utils/helpers'

type LoginPageProps = {
    storyId: string,
    fileId: [string]
    edit?: string
}

const Page = ({ props }: { props: LoginPageProps }): JSX.Element => {
    const fileId = props.fileId?.find(() => true)
    const valid = useValidation();
    
    return valid && isObjectId(props.storyId) && (
        <StoryContext 
            editMode={props.edit === 'true'}
            storyId={props.storyId} 
            fileId={isObjectId(fileId) ? fileId : null}
            viewMode={false}>
            <StoryPage/>
        </StoryContext>
    )
}

export default Page;