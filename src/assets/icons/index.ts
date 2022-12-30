import AdvantageIcon from './advantage.svg';
import DisadvantageIcon from './disadvantage.svg';
import CritIcon from './crit.svg';
import DragonIcon from './dragon.svg';
import HandIcon from './hand.svg';
import ConcentrationIcon from './concentration.svg'
import RitualIcon from './ritual.svg'
import AcidIcon from './dmg/acid.svg';
import BludgeoningIcon from './dmg/bludgeoning.svg';
import ColdIcon from './dmg/cold.svg';
import FireIcon from './dmg/fire.svg';
import ForceIcon from './dmg/force.svg';
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


export {
    AdvantageIcon,
    DisadvantageIcon,
    DragonIcon,
    HandIcon,
    CritIcon,
    ConeIcon,
    SphereIcon,
    LineIcon,
    CubeIcon
}

export const Icons: { [key: string]: React.FunctionComponent<React.SVGAttributes<SVGElement>> } = {
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