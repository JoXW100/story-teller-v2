import AdvantageIcon from './advantage.svg';
import DisadvantageIcon from './disadvantage.svg';
import CritIcon from './crit.svg';
import DragonIcon from './dragon.svg';
import HandIcon from './hand.svg';
import AcidIcon from './dmg/acid.svg';
import BludgeoningIcon from './dmg/bludgeoning.svg';
import FireIcon from './dmg/fire.svg';
import PiercingIcon from './dmg/piercing.svg';
import PoisonIcon from './dmg/poison.svg';
import SlashingIcon from './dmg/slashing.svg';
import ConeIcon from './shapes/cone.svg';
import SphereIcon from './shapes/sphere.svg';
import LineIcon from './shapes/line.svg'
import CubeIcon from './shapes/cube.svg'

export {
    AdvantageIcon,
    DisadvantageIcon,
    DragonIcon,
    HandIcon,
    CritIcon,
    ConeIcon,
    SphereIcon,
}

export const Icons: { [key: string]: React.FunctionComponent<React.SVGAttributes<SVGElement>> } = {
    advantage: AdvantageIcon,
    disadvantage: DisadvantageIcon,
    crit: CritIcon,
    dragon: DragonIcon,
    hand: HandIcon,
    cone: ConeIcon,
    sphere: SphereIcon,
    acid: AcidIcon,
    bludgeoning: BludgeoningIcon,
    fire: FireIcon,
    piercing: PiercingIcon,
    poison: PoisonIcon,
    slashing: SlashingIcon,
    line: LineIcon,
    cube: CubeIcon
}

export default Icons;