import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { openPopup } from 'components/common/popupHolder';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditIcon from '@mui/icons-material/DriveFileRenameOutline';
import ConfirmationPopup from 'components/common/confirmationPopup';
import Localization from 'utils/localization';
import EditStoryPopup from './editStoryPopup';
import { DBResponse } from 'types/database';
import { PageStatus, StoryCardData } from 'types/homePage';
import { StoryDeleteResult, StoryUpdateResult } from 'types/database/stories';
import styles from 'styles/homePage.module.scss'

type StoryCardProps = React.PropsWithRef<{
    data: StoryCardData
    setStatus: (status: PageStatus) => void
}>

const StoryCard = ({ data, setStatus }: StoryCardProps): JSX.Element => {
    const router = useRouter()

    const handleClick = () => {
        if (data.type === 'create') {
            // Navigate to create story page
            setStatus(PageStatus.Create)
        } else {
            // Navigate to story page
            router.push(`story/${data.id}`)
        }
    }

    const Body = useMemo(() => {
        return data.type === "create" 
            ? CreateCardBody 
            : StoryCardBody
    }, [data.type]) 

    return (
        <div className={styles.storyCard} onClick={handleClick}>
            <Body data={data} setStatus={setStatus}/>
        </div>
    )
}

const CreateCardBody = (): JSX.Element => {
    return <>
        <div className={styles.label}> 
            { Localization.toText('storyCard-create-story') } 
        </div>
        <div className={styles.create}>
            <AddOutlinedIcon/>
        </div>
    </>
}

const StoryCardBody = ({ data, setStatus }: StoryCardProps): JSX.Element => {
    const handleDelete = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation()
        const optionYes = Localization.toText('create-confirmationYes');
        const optionNo = Localization.toText('create-confirmationNo');
        openPopup(
            <ConfirmationPopup 
                header={Localization.toText('create-confirmationHeader')} 
                options={[optionYes, optionNo]} 
                callback={(response) => {
                    if (response === optionYes) {
                        fetch('/api/database/deleteStory', { method: 'DELETE',
                            body: JSON.stringify({ storyId: data.id })
                        })
                        .then((res) => res.json())
                        .then((res: DBResponse<StoryDeleteResult>) => {
                            if (!res.success)
                                console.warn(res.result as string)
                        })
                        .finally(() => setStatus(PageStatus.Loading))
                        .catch(console.error);
                    }
                }}  
            />
        )
    }

    const handleEdit = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation()
        openPopup(<EditStoryPopup 
            values={{ name: data.name, desc: data.desc }} 
            callback={(response) => {
                if (response) {
                    fetch('/api/database/updateStory', {
                        method: 'PUT',
                        body: JSON.stringify({ storyId: data.id, update: response })
                    })
                    .then((res) => res.json())
                    .then((res: DBResponse<StoryUpdateResult>) => {
                        if (!res.success)
                            console.warn(res.result as string)
                    })
                    .finally(() => setStatus(PageStatus.Loading))
                    .catch(console.error);
                }
            }}
        />)
    }

    return <>
        <div className={styles.label}>{data.name}</div>
        <div className={styles.desc}>{data.desc}</div>
        <div className={styles.date}> 
            { new Date(data.dateUpdated).toLocaleDateString("se-SW", { 
                hour: "numeric", 
                minute: "numeric" 
            })} 
        </div>
        <div 
            className={styles.delete} 
            onClick={handleDelete}
            tooltips={Localization.toText("create-delete")}
        > <RemoveIcon/> </div>      
        <div 
            className={styles.edit} 
            onClick={handleEdit}
            tooltips={Localization.toText("create-edit")}
        > <EditIcon/> </div>
    </>
}
 
export default StoryCard;