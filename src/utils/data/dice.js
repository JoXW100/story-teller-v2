import { DXIcon, D4Icon, D6Icon, D8Icon, D10Icon, D12Icon, D20Icon, D100Icon } from "assets/dice";

class Dice {
    #type;
    
    /**
     * @param {number | string} type 
     */
    constructor(type) {
        this.#type = parseInt(type);
    }

    /** @returns {JSX.Element} */
    get icon() {
        switch(this.#type) {
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

    /** @returns {string} */
    get text() {
        return `d${this.#type}`;
    }

    get num() {
        return this.#type;
    }

    /**
     * @param {number} num
     * @returns {[number]}
     */
    roll(num = 1) {
        var results = new Array(num)
        for (let index = 0; index < num; index++) {
            results[index] = Math.ceil(Math.random() * this.#type);
        }
        return results;
    }
}



export default Dice;