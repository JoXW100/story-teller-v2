import { useMemo } from 'react';
import DropdownMenu from 'components/common/controls/dropdownMenu';
import LinkDropdownMenu from 'components/common/controls/linkDropdownMenu';
import LinkInput from 'components/common/controls/linkInput';
import Elements from 'data/elements';
import CharacterData from 'data/structures/character';
import ClassData from 'data/structures/class';
import { getOptionType } from 'data/optionData';
import { ChoiceChoiceData, EnumChoiceData } from 'types/database/files/modifierCollection';
import { FileContextDispatch } from 'types/context/fileContext';
import { ICharacterStorage } from 'types/database/files/character';
import styles from 'styles/renderer.module.scss';

type CharacterClassPageProps = React.PropsWithRef<{
    character: CharacterData 
    classData: ClassData
    storage: ICharacterStorage
    setStorage: FileContextDispatch["setStorage"]
}>

const reduceEnumOptions = (value: EnumChoiceData) => (
    value.options.reduce((prev, option) => (
        { ...prev, [option]: getOptionType(value.enum).options[option] }
    ), { null: "Unset" })
)

const reduceChoiceOptions = (value: ChoiceChoiceData) => (
    value.options.reduce((prev, option) => (
        { ...prev, [option.id]: option.label }
    ), { null: "Unset" })
)

const CharacterClassPage = ({ character, classData, storage, setStorage }: CharacterClassPageProps): JSX.Element => {
    const choices = useMemo(() => character.modifiers.getChoices(), [character])
    const classStorage = storage?.classData ?? {}
    
    const handleChange = (value: any, key: string, index: number = -1) => {
        let validStorage = Object.keys(classStorage).reduce<Record<string, any[]>>((prev, key) => (
            Object.keys(choices).includes(key) || key === "$subclass" ? { ...prev, [key]: classStorage[key] } : prev
        ), {})
        let newValue = validStorage[key] ?? []
        if (index < 0) {
            newValue = value
        } else {
            newValue[index] = value
        }
        setStorage("classData", { ...validStorage, [key]: newValue });
    }

    return (
        <>
            { character.level >= classData.subclassLevel &&
                <div className={styles.modifierChoice}>
                    <Elements.Bold>{`Subclass:`} </Elements.Bold>
                    <LinkDropdownMenu
                        value={classStorage.$subclass ?? null}
                        itemClassName={styles.dropdownItem}
                        values={classData.subclasses}
                        allowNull={true}
                        onChange={(value) => handleChange(value, "$subclass")}/>
                </div>
            }{ Object.keys(choices).flatMap(key => {
                let value = choices[key]
                return Array.from({ length: value.num }).map((_, i) =>
                    <div className={styles.modifierChoice} key={key + i}>
                        <Elements.Bold>{`${value.label}:`} </Elements.Bold>
                        { value.type === "choice" &&
                            <DropdownMenu
                                value={classStorage[key]?.[i] ?? null}
                                itemClassName={styles.dropdownItem}
                                values={reduceChoiceOptions(value)}
                                onChange={(value) => handleChange(value, key, i)}/>
                        }
                        { value.type === "enum" &&
                            <DropdownMenu
                                value={classStorage[key]?.[i] ?? null}
                                itemClassName={styles.dropdownItem}
                                values={reduceEnumOptions(value)}
                                onChange={(value) => handleChange(value, key, i)}/>
                        }
                        { value.type === "file" && value.allowAny === false &&
                            <LinkDropdownMenu
                                value={classStorage[key]?.[i] ?? null}
                                itemClassName={styles.dropdownItem}
                                values={value.options}
                                allowNull={true}
                                onChange={(value) => handleChange(value, key, i)}/>
                        }
                        { value.type === "file" && value.allowAny &&
                            <LinkInput
                                value={classStorage[key]?.[i] ?? null}
                                fileTypes={value.options}
                                placeholder="File ID..."
                                onChange={(value) => handleChange(value, key, i)}/>
                        }
                    </div>
                )
            })}
        </>
    )
}

export default CharacterClassPage;