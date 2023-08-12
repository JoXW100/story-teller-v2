import AdvantageIcon from './advantage.svg';
import DisadvantageIcon from './disadvantage.svg';
import CritIcon from './crit.svg';
import DragonIcon from './dragon.svg';
import HandIcon from './hand.svg';
import ConcentrationIcon from './concentration.svg'
import RitualIcon from './ritual.svg'
import CrossedSwords from './crossedSwords.svg';
import AcidIcon from './dmg/acid.svg';
import BludgeoningIcon from './dmg/bludgeoning.svg';
import ColdIcon from './dmg/cold.svg';
import FireIcon from './dmg/fire.svg';
import ForceIcon from './dmg/force.svg';
import HealthIcon from './dmg/health.svg';
import LightningIcon from './dmg/lightning.svg';
import NecroticIcon from './dmg/necrotic.svg';
import PiercingIcon from './dmg/piercing.svg';
import PoisonIcon from './dmg/poison.svg';
import PsychicIcon from './dmg/psychic.svg';
import RadiantIcon from './dmg/radiant.svg';
import SlashingIcon from './dmg/slashing.svg';
import ThunderIcon from './dmg/thunder.svg';
import ConeIcon from './shapes/cone.svg';
import SphereIcon from './shapes/sphere.svg';
import LineIcon from './shapes/line.svg';
import CubeIcon from './shapes/cube.svg';
import { FileType } from 'types/database/files';

export {
    AdvantageIcon,
    DisadvantageIcon,
    DragonIcon,
    HandIcon,
    ConcentrationIcon,
    RitualIcon,
    CrossedSwords,
    CritIcon,
    ConeIcon,
    SphereIcon,
    LineIcon,
    CubeIcon
}

import DocumentIcon from '@mui/icons-material/InsertDriveFileSharp';
import CharacterIcon from '@mui/icons-material/PersonSharp';
import FolderIcon from '@mui/icons-material/FolderSharp';
import SpellIcon from '@mui/icons-material/AutoAwesomeSharp';
import ClassIcon from '@mui/icons-material/SchoolSharp';

export const FileIcons: Record<FileType, React.FunctionComponent<React.SVGAttributes<SVGElement>>> = {
    [FileType.Ability]: HandIcon,
    [FileType.Character]: CharacterIcon,
    [FileType.Class]: ClassIcon,
    [FileType.Creature]: DragonIcon,
    [FileType.Document]: DocumentIcon,
    [FileType.Encounter]: CrossedSwords,
    [FileType.Folder]: FolderIcon,
    [FileType.Spell]: SpellIcon,
    [FileType.Root]: null,
    [FileType.Empty]: null
}

export const Icons: Record<string,React.FunctionComponent<React.SVGAttributes<SVGElement>>> = {
    advantage: AdvantageIcon,
    disadvantage: DisadvantageIcon,
    crit: CritIcon,
    dragon: DragonIcon,
    hand: HandIcon,
    concentration: ConcentrationIcon,
    ritual: RitualIcon,
    cone: ConeIcon,
    sphere: SphereIcon,
    line: LineIcon,
    cube: CubeIcon,
    acid: AcidIcon,
    bludgeoning: BludgeoningIcon,
    cold: ColdIcon,
    fire: FireIcon,
    force: ForceIcon,
    health: HealthIcon,
    lightning: LightningIcon,
    necrotic: NecroticIcon,
    piercing: PiercingIcon,
    poison: PoisonIcon,
    psychic: PsychicIcon,
    radiant: RadiantIcon,
    slashing: SlashingIcon,
    thunder: ThunderIcon
}

export default Icons;