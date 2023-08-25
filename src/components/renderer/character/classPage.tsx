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
import styles from 'styles/renderer.module.scss';

type CharacterClassPageProps = React.PropsWithRef<{
    character: CharacterData 
    classData: ClassData
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

const CharacterClassPage = ({ character, classData, setStorage }: CharacterClassPageProps): JSX.Element => {
    const choices = useMemo(() => character.modifiers.getChoices(), [character])
    const storage = classData.storage?.classData ?? {}
    
    const handleChange = (value: any, key: string) => {
        let validStorage = Object.keys(storage).reduce((prev, key) => (
            Object.keys(choices).includes(key) || key === "$subclass" ? { ...prev, [key]: storage[key] } : prev
        ), {})
        setStorage("classData", { ...validStorage, [key]: value });
    }

    return (
        <>
            { character.level >= classData.subclassLevel &&
                <div className={styles.modifierChoice}>
                    <Elements.Bold>{`Subclass:`} </Elements.Bold>
                    <LinkDropdownMenu
                        value={storage.$subclass ?? null}
                        itemClassName={styles.dropdownItem}
                        values={classData.subclasses}
                        allowNull={true}
                        onChange={(value) => handleChange(value, "$subclass")}/>
                </div>
            }{ Object.keys(choices).map(key => {
                let value = choices[key]
                return (
                    <div className={styles.modifierChoice} key={key}>
                        <Elements.Bold>{`${value.label}:`} </Elements.Bold>
                        { value.type === "choice" &&
                            <DropdownMenu
                                value={storage[key] ?? null}
                                itemClassName={styles.dropdownItem}
                                values={reduceChoiceOptions(value)}
                                onChange={(value) => handleChange(value, key)}/>
                        }
                        { value.type === "enum" &&
                            <DropdownMenu
                                value={storage[key] ?? null}
                                itemClassName={styles.dropdownItem}
                                values={reduceEnumOptions(value)}
                                onChange={(value) => handleChange(value, key)}/>
                        }
                        { value.type === "file" && value.allowAny === false &&
                            <LinkDropdownMenu
                                value={storage[key] ?? null}
                                itemClassName={styles.dropdownItem}
                                values={value.options}
                                allowNull={true}
                                onChange={(value) => handleChange(value, key)}/>
                        }
                        { value.type === "file" && value.allowAny &&
                            <LinkInput
                                value={storage[key] ?? null}
                                fileTypes={value.options}
                                placeholder="File ID..."
                                onChange={(value) => handleChange(value, key)}/>
                        }
                    </div>
                )
            })}
        </>
    )
}

export default CharacterClassPage;