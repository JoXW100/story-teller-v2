import { useMemo } from 'react';
import { useParser } from 'utils/parser';
import Elements from 'data/elements';
import CharacterData from 'data/structures/character';
import Logger from 'utils/logger';
import CharacterFile from 'types/database/files/character';

type CharacterFileRendererProps = React.PropsWithRef<{
    file: CharacterFile
}>

const SimpleCharacterRenderer = ({ file }: CharacterFileRendererProps): JSX.Element => {
    const character = useMemo(() => new CharacterData(file.metadata, null), [file.metadata])
    const content = useParser(file.content.text, character, "$content");
    const appearance = useParser(character.appearance, character, "appearance")
    const description = useParser(character.description, character, "description")
    Logger.log("SimpleCharacterRenderer", character)
    return (
        <>
            <Elements.Align>
                <Elements.Block>
                    <Elements.Header1> {character.name} </Elements.Header1>
                    {`${character.sizeText} ${character.typeText}, ${character.alignmentText}`}
                    <Elements.Line/>
                    <Elements.Image options={{href: character.portrait}}/>
                </Elements.Block>
                <Elements.Line/>
                <Elements.Block>
                    <div><Elements.Bold>Race </Elements.Bold>{character.raceText}</div>
                    <div><Elements.Bold>Gender </Elements.Bold>{character.genderText}</div>
                    <div><Elements.Bold>Age </Elements.Bold>{character.age}</div>
                    <div><Elements.Bold>Height </Elements.Bold>{character.height}</div>
                    <div><Elements.Bold>Weight </Elements.Bold>{character.weight}</div>
                    <div><Elements.Bold>Occupation </Elements.Bold>{character.occupation}</div>
                    { character.appearance.length > 0 ? <>
                        <Elements.Line/>
                        <Elements.Header3>Appearance</Elements.Header3>
                        {appearance}
                    </> : null }
                    { character.description.length > 0 ? <>
                        <Elements.Line/>
                        <Elements.Header3>Description</Elements.Header3>
                        {description}
                    </> : null }
                </Elements.Block>
            </Elements.Align>
            {content && <Elements.Line/>}
            {content}
        </>
    )
}

export default SimpleCharacterRenderer;