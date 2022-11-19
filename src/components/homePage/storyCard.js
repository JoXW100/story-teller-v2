import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { openPopup } from 'components/popupHolder';
import { PageStatus } from '@types/homePage';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditIcon from '@mui/icons-material/DriveFileRenameOutline';
import ConfirmationPopup from 'components/common/confirmationPopup';
import Localization from 'classes/localization';
import styles from 'styles/homePage/storyCard.module.scss'
import EditStoryPopup from './editStoryPopup';

/**
 * @param {{ 
 *  data: import('@types/homePage').StoryCardData, 
 *  setState: React.Dispatch<import('@types/homePage').HomePageState>
 * }} 
 */
const StoryCard = ({ data, setState }) => {
    
    const router = useRouter()

    const handleClick = () => {
        if (data.type === 'create') {
            // Navigate to create story page
            setState((state) => ({ ...state, status: PageStatus.Create }))
        }
        else {
            // Navigate to story page
            router.push(`story/${data._id}`)
        }
    }

    const Body = useMemo(() => data.type === "create" 
        ? CreateCardBody 
        : StoryCardBody
    , [data.type]);

    return (
        <div 
            className={styles.main}
            onClick={handleClick}
        >
            <Body data={data} setState={setState}/>
        </div>
    )
}

const CreateCardBody = () => {
    return <>
        <div className={styles.label}> 
            { Localization.toText('storyCard-create-story') } 
        </div>
        <div className={styles.create}>
            <AddOutlinedIcon 
                sx={{ 
                    width: "80%", 
                    height: "80%"
                }}
            />
        </div>
    </>
}

/**
 * @param {{ 
 *  data: import('@types/homePage').StoryCardData, 
 *  setState: React.Dispatch<import('@types/homePage').HomePageState>
 * }} 
 */
const StoryCardBody = ({ data, setState }) => {

    /** @param {React.MouseEvent<HTMLDivElement, React.MouseEvent} e */
    const handleDelete = (e) => {
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
                        fetch('/api/database/deleteStory', {
                            method: 'DELETE',
                            body: JSON.stringify({ storyId: data._id })
                        })
                        .then((res) => res.json())
                        .finally(() => setState((state) => ({ ...state, status: PageStatus.Loading })))
                        .catch(console.error);
                    }
                }}  
            />
        )
    }

    /** @param {React.MouseEvent<HTMLDivElement, React.MouseEvent} e */
    const handleEdit = (e) => {
        e.preventDefault()
        e.stopPropagation()
        openPopup(<EditStoryPopup 
            values={{ name: data.name, desc: data.desc }} 
            callback={(response) => {
                if (response) {
                    fetch('/api/database/updateStory', {
                        method: 'PUT',
                        body: JSON.stringify({ storyId: data._id, update: response })
                    })
                    .then((res) => res.json())
                    .finally(() => setState((state) => ({ ...state, status: PageStatus.Loading })))
                    .catch(console.error);
                }
            }}
        />)
    }

    return <>
        <div className={styles.label}> { data.name  } </div>
        <div className={styles.desc}> { data.desc  } </div>
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
        >
            <RemoveIcon/>
        </div>      
        <div 
            className={styles.edit} 
            onClick={handleEdit}
            tooltips={Localization.toText("create-edit")}
        >
            <EditIcon/>
        </div>
    </>
}
 
export default StoryCard;