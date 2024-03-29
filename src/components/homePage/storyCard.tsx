import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { openPopup } from 'components/common/popupHolder';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditIcon from '@mui/icons-material/DriveFileRenameOutline';
import ConfirmationPopup from 'components/common/confirmationPopup';
import Communication from 'utils/communication';
import Localization from 'utils/localization';
import EditStoryPopup from './editStoryPopup';
import { DBResponse } from 'types/database';
import { PageStatus, StoryCardData } from 'types/homePage';
import styles from 'styles/pages/homePage/storyCard.module.scss'
import Logger from 'utils/logger';
import { StoryDeleteResult, StoryUpdateResult } from 'types/database/responses';

type StoryCardProps = React.PropsWithRef<{
    data: StoryCardData
    setStatus: (status: PageStatus) => void
    zIndex: number
}>

type StoryCardBodyProps = React.PropsWithRef<{
    data: StoryCardData
    setStatus: (status: PageStatus) => void
}>

const StoryCard = ({ data, setStatus, zIndex }: StoryCardProps): JSX.Element => {
    const router = useRouter()

    const handleClick = () => {
        if (data.type === 'create') {
            setStatus(PageStatus.Create)
        } else {
            router.push(`story/${data.id}`)
        }
    }

    const Body = useMemo(() => {
        return data.type === "create" 
            ? CreateCardBody 
            : StoryCardBody
    }, [data.type]) 

    return (
        <div className={styles.storyCard} onClick={handleClick} style={{ zIndex: zIndex }}>
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

const StoryCardBody = ({ data, setStatus }: StoryCardBodyProps): JSX.Element => {
    const handleDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation()
        const optionYes = Localization.toText('create-confirmationYes');
        const optionNo = Localization.toText('create-confirmationNo');
        openPopup(
            <ConfirmationPopup 
                header={Localization.toText('create-confirmationHeader')} 
                description={Localization.toText('create-confirmationDeleteDescription', data.name)}
                options={[optionYes, optionNo]} 
                callback={(response) => {
                    if (response === optionYes) {
                        Communication.deleteStory(data.id)
                        .then((res: DBResponse<StoryDeleteResult>) => {
                            if (!res.success)
                                Logger.warn("StoryCardBody.deleteStory", res.result);
                            setStatus(PageStatus.Loading)
                        })
                    }
                }}  
            />
        )
    }

    const handleEdit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation()
        openPopup(<EditStoryPopup 
            values={{ name: data.name, desc: data.desc }} 
            callback={(response) => {
                if (response) {
                    Communication.updateStory(data.id, response)
                    .then((res: DBResponse<StoryUpdateResult>) => {
                        if (!res.success)
                            Logger.warn("StoryCardBody.updateStory", res.result);
                        setStatus(PageStatus.Loading)
                    })
                }
            }}
        />)
    }

    return <>
        <div className={styles.label}>{data.name}</div>
        <div className={styles.desc}>{data.desc}</div>
        <button 
            className={styles.delete} 
            onClick={handleDelete}
            tooltips={Localization.toText("common-delete")}> 
            <RemoveIcon/>
        </button>
        <button
            className={styles.edit} 
            onClick={handleEdit}
            tooltips={Localization.toText("common-edit")}>
            <EditIcon/> 
        </button>
        <div className={styles.date}> 
            { new Date(data.dateUpdated).toLocaleDateString("se-SW", { 
                hour: "numeric", 
                minute: "numeric" 
            })} 
        </div>
    </>
}
 
export default StoryCard;