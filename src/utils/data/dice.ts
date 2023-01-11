import { DXIcon, D4Icon, D6Icon, D8Icon, D10Icon, D12Icon, D20Icon, D100Icon } from "assets/dice";

class Dice {
    private readonly type: number;
    
    constructor(type: number | string) {
        this.type = parseInt(String(type));
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

    /** Returns the average value of a given number of dice */
    static average(type: number | string, num: number): number {
        var t: number = parseInt(String(type))
        return t <= 0 
            ? 0 
            : Math.floor((t + 1) / 2.0 * num)
    }

    /** Returns a list of numbers of random values in the range [1..num] */
    public roll(num: number = 1): number[] {
        return [...Array(num)].map(() => this.rollOnce());
    }

    /** Returns a number of random values in the range [num..num * type] */
    public rollSum(num: number = 1): number {
        return this.roll(num).reduce((prev, value) => prev + value, 0)
    }

    /** Returns a number of random values in the range [1..type] */
    public rollOnce(): number {
        return Math.ceil(Math.random() * this.type);
    }
}



export default Dice;