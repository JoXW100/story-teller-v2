

class Item {
    #value;
    #next;

    constructor(value, next) {
        this.#value = value;
        this.#next = next;
    }

    /**
     * @param {Item} value
     */
    set next(value) {
        this.#next = value;
    }

    /**
     * @returns {?Item}
     */
    get next() {
        return this.#next;
    }

    /**
     * @returns {any}
     */
    get value() {
        return this.#value;
    }
}

class Queue {
    #size;
    #num;
    #first;
    #last;

    constructor(size) {
        if (size <= 0)
            throw new Error("Size must be greater than zero");
        this.#size = size;
        this.#num = 0;
        this.#first = new Item(null, null);
        this.#last = this.#first;
    }

    /**
     * The size of the queue
     * @returns {number}
     */
    get length() { return this.#num };

    /**
     * Adds and item to the queue
     * @param {any} value 
     */
    add(value) {
        this.#last = this.#last.next = new Item(value, null);
        if (this.#num + 1 > this.#size) {
            this.#first = this.#first.next;
        }
        else {
            this.#num++;
        }
    }

    /**
     * @returns {[any]}
     */
    toArray() {
        var i = 0;
        var result = new Array(this.length);
        var selected = this.#first;
        while((selected = selected.next)) {
            result[i++] = selected.value;
        }
        return result;
    }

    /**
     * 
     * @param {(a: any, b:any) => number} callbackfn 
     * @returns {[any]}
     */
    sort(callbackfn) {
        return this.toArray().sort(callbackfn);
    }

    /**
     * 
     * @param {(value: any, index: number, array: any[]) => any} callbackfn 
     */
    map(callbackfn) {
        return this.toArray().map(callbackfn);
    }

    /**
     * 
     * @param {(value: any) => unknown} predicate 
     * @returns {boolean}
     */
    some(predicate) {
        var selected = this.#first;
        while((selected = selected.next)) {
            if (predicate(selected.value)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 
     * @param {(value: any) => any} predicate 
     * @returns {[any]}
     */
    filter(predicate) {
        var result = [];
        var selected = this.#first;
        while((selected = selected.next)) {
            if (predicate(selected.value)) {
                result.push(selected.value);
            }
        }
        return result;
    }
}

export default Queue;