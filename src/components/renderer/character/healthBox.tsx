import { useContext, useState } from "react"
import { Context } from "components/contexts/fileContext"
import Elements from "data/elements"
import CharacterData from "data/structures/character"
import { ICharacterStorage } from "types/database/files/character"
import { RollType } from "types/dice"
import styles from 'styles/renderer.module.scss';
import Beyond20 from "utils/beyond20"


type HealthBoxProps = React.PropsWithRef<{
    character: CharacterData
    storage: ICharacterStorage
}>

interface HealthBoxState {
    healDamageInput: string
    hpInput: string
    tempInput: string
}

const HealthBox = ({ character, storage }: HealthBoxProps): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const [state, setState] = useState<HealthBoxState>({
        healDamageInput: "",
        hpInput: null,
        tempInput: null
    }) 

    const handleChangeHealthInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setState({ ...state, healDamageInput: e.target.value })
    }

    const changeHealth = (value: number) => {
        let max = character.healthValue
        let health = storage.health ?? 0
        let temp = storage.tempHealth ?? 0
        if (value < 0) {
            if (-value > temp) {
                let rest = value + temp
                health = Math.max(health + rest, 0)
                dispatch.setStorage("health", health)
            }
            temp = Math.max(temp + value, 0)
            dispatch.setStorage("tempHealth", temp)
        } else {
            health = Math.min(health + value, max)
            dispatch.setStorage("health", health)
        }
        Beyond20.sendHealthUpdate(character.name, health, max, temp)
    }

    const handleHealClick = () => {
        let value = parseInt(state.healDamageInput)
        if (!isNaN(value)) {
            changeHealth(value)
        }
        setState({ ...state, healDamageInput: "" })
    }

    const handleDamageClick = () => {
        let value = parseInt(state.healDamageInput)
        if (!isNaN(value)) {
            changeHealth(-value)
        }
        setState({ ...state, healDamageInput: "" })
    }

    const handleHPClick = () =>{
        setState({ ...state, hpInput: String(storage.health ?? character.healthValue)})
    }

    const handleHPChanged: React.ChangeEventHandler<HTMLInputElement> = (e) =>{
        setState({ ...state, hpInput: e.target.value })
    }

    const handleHPFocusLost: React.FocusEventHandler<HTMLInputElement> = (e) =>{
        let number = parseInt(e.target.value)
        if (!isNaN(number)) {
            dispatch.setStorage("health", Math.min(Math.max(number, 0), character.healthValue))
        }
        setState({ ...state, hpInput: null })
    }

    const handleTempClick = () =>{
        setState({ ...state, tempInput: String(storage.tempHealth ?? 0)})
    }

    const handleTempChanged: React.ChangeEventHandler<HTMLInputElement> = (e) =>{
        setState({ ...state, tempInput: e.target.value })
    }

    const handleTempFocusLost: React.FocusEventHandler<HTMLInputElement> = (e) =>{
        let number = parseInt(e.target.value)
        if (!isNaN(number)) {
            dispatch.setStorage("tempHealth", Math.max(number, 0))
        }
        setState({ ...state, tempInput: null })
    }

    return (
        <Elements.Align>
            <div className={styles.armorBox}>
                <b>AC</b>
                <b>{character.acValue}</b>
            </div>
            <div className={styles.initiativeBox}>
                <b>Initiative</b>
                <Elements.Roll options={{ 
                    mod: character.initiativeValue.toString(), 
                    desc: "Initiative",
                    type: RollType.Initiative,
                    tooltips: "Roll Initiative"
                }}/>
            </div>
            <div className={styles.healthBox}>
                <div>
                    <button 
                        disabled={state.healDamageInput.length == 0} 
                        onClick={handleHealClick}>
                        Heal
                    </button>
                    <input 
                        value={state.healDamageInput} 
                        type='number' 
                        onChange={handleChangeHealthInput}/>
                    <button 
                        disabled={state.healDamageInput.length == 0} 
                        onClick={handleDamageClick}>
                        Damage
                    </button>
                </div>
                <div>
                    <b>HP</b>
                    <span/>
                    <b>MAX</b>
                    <b>TEMP</b>
                    
                    { state.hpInput === null 
                        ? <span onClick={handleHPClick}>{storage.health ?? character.healthValue}</span>
                        : <input type='number' autoFocus onChange={handleHPChanged} onBlur={handleHPFocusLost} value={state.hpInput}/>
                    }
                    <b>/</b>
                    <span>{`${character.healthValue} `}</span>
                    { state.tempInput === null 
                        ? <span onClick={handleTempClick}>{(storage.tempHealth ?? 0) <= 0 ? '-' : storage.tempHealth}</span>
                        : <input type='number' autoFocus onChange={handleTempChanged} onBlur={handleTempFocusLost} value={state.tempInput}/>
                    }

                    <b>Hit Points</b>
                </div>
            </div>
        </Elements.Align>
    )
}

export default HealthBox