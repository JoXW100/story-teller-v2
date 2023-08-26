import Elements from 'data/elements';
import CharacterData from 'data/structures/character';

type CharacterBackgroundPageProps = React.PropsWithRef<{
    character: CharacterData 
    appearance: JSX.Element 
    description: JSX.Element  
    history: JSX.Element 
    notes: JSX.Element
}>

const CharacterBackgroundPage = ({ character, appearance, description, history, notes }: CharacterBackgroundPageProps): JSX.Element => {
    return (
        <>
            {`${character.sizeText} ${character.typeText}, ${character.alignmentText}, ${character.className}`}
            <Elements.Line/>
            <Elements.Image options={{href: character.portrait}}/>
            <Elements.Line/>
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
            { character.history.length > 0 ? <>
                <Elements.Line/>
                <Elements.Header3>History</Elements.Header3>
                {history}
            </> : null }
            { character.notes.length > 0 ? <>
                <Elements.Line/>
                <Elements.Header3>Notes</Elements.Header3>
                {notes}
            </> : null }
        </>
    )
}

export default CharacterBackgroundPage;