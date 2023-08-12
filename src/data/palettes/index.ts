import { Palette } from "types/palettes"
import Cobalt from "./cobalt.json"
import Coral from "./coral.json"
import Dark from "./dark.json"
import Neon from "./neon.json"
import Cloud from "./cloud.json"

const Palettes = {
    "cobalt": Cobalt,
    "coral": Coral,
    "dark": Dark,
    "neon": Neon,
    "cloud": Cloud
} as Record<string, Palette>

export default Palettes

