import { useContext } from 'react'
import ViewPage from 'components/viewPage'
import FileContext from 'components/contexts/fileContext'
import StoryContext from 'components/contexts/storyContext'
import { Context } from 'components/contexts/appContext'
import { useValidation } from 'utils/handlers/validation'
import { isObjectId } from 'utils/helpers'

type LoginPageProps = {
    props: {
        fileId?: [string]
    }
}

const Page = ({ props }: LoginPageProps): JSX.Element => {
    const [context] = useContext(Context)
    const fileId = props.fileId?.find(() => true)
    const valid = useValidation();
    
    return valid && isObjectId(fileId) && (
        <StoryContext viewMode={true} storyId={null} fileId={fileId} editMode={false} hideRolls={context.hideRolls}>
            <FileContext fileId={fileId}>
                <ViewPage/>
            </FileContext>
        </StoryContext>
    )
}

export default Page;