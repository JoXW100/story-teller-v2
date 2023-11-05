import { DXIcon, D4Icon, D6Icon, D8Icon, D10Icon, D12Icon, D20Icon, D100Icon } from "assets/dice";
import { DiceType } from "types/database/dnd";
import Random from "utils/random";

class Dice {
    private readonly type: number;
    private static random = new Random()
    
    constructor(type: number | string | DiceType) {
        let num: number = Number(type);
        if (isNaN(num)) {
            throw new Error("Error: NaN Dice type")
        }
        this.type = num
    }

    public get icon(): any {
        switch(this.type) {
            case 4:
                return D4Icon;
            case 6:
                return D6Icon;
            case 8:
                return D8Icon;
            case 10:
                return D10Icon;
            case 12:
                return D12Icon;
            case 20:
                return D20Icon;
            case 100:
                return D100Icon;
            default:
                return DXIcon;
        }
    }

    public get text(): string {
        return `d${this.type}`;
    }
    
    public get num(): number {
        return this.type;
    }

    public get average(): number {
        return (this.type + 1) / 2.0
    }

    /** Returns the average value of a given number of dice */
    static average(type: number | string): number {
        let t: number = parseInt(String(type))
        return isNaN(t) || t <= 0
            ? 0 
            : (t + 1) / 2.0
    }

    public static seed(seed: number) {
        this.random.init_seed(seed)
    }

    /** Returns a list of numbers of random values in the range [1..num] */
    public roll(num: number = 1): number[] {
        return Array.from({ length: num }).map(() => this.rollOnce());
    }

    /** Returns a number of random values in the range [num..num * type] */
    public rollSum(num: number = 1): number {
        return this.roll(num).reduce((prev, value) => prev + value, 0)
    }

    /** Returns a number of random values in the range [1..type] */
    public rollOnce(): number {
        return Math.ceil(Dice.random.random() * this.type);
    }

    public toString() {
        return this.text
    }
}



export default Dice;