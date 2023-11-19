import { useMemo } from 'react';
import Elements from 'data/elements';
import RaceData from "data/structures/race";
import { useParser } from 'utils/parser';
import Logger from 'utils/logger';
import { RendererObject } from 'types/database/editor';
import { RaceFile, IRaceMetadata } from 'types/database/files/race';
import { FileMetadataQueryResult } from 'types/database/responses';

type RaceFileRendererProps = React.PropsWithRef<{
    file: RaceFile
}>

type RaceLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<IRaceMetadata>
}>

const RaceFileRenderer = ({ file }: RaceFileRendererProps): JSX.Element => {
    const race = useMemo(() => new RaceData(file.metadata), [file?.metadata])
    const description = useParser(race.description, file.metadata, 'description')

    Logger.log("Race", race)

    return <>
        <Elements.Header1 options={{ underline: 'true' }}> 
            {file.metadata?.name}
        </Elements.Header1>
        {description}
    </>
}

const RaceLinkRenderer = ({ file }: RaceLinkRendererProps): JSX.Element => {
    return <>
        <Elements.Header3>{file.metadata?.name}</Elements.Header3>
        { file.metadata?.description }
    </>
}

const RaceRenderer: RendererObject<RaceFile> = {
    fileRenderer: RaceFileRenderer,
    linkRenderer: RaceLinkRenderer
}

export default RaceRenderer;