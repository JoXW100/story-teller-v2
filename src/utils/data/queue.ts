

class QueueItem<T> {
    public value: T;
    public next?: QueueItem<T>;

    constructor(value: T, next?: QueueItem<T>) {
        this.value = value;
        this.next = next;
    }
}

class Queue<T> {
    private size: number;
    private num: number;
    private first: QueueItem<T>;
    private last: QueueItem<T>;

    constructor(size: number) {
        if (size <= 0)
            throw new Error("Size must be greater than zero");
        this.size = size;
        this.num = 0;
        this.first = new QueueItem<T>(null, null);
        this.last = this.first;
    }

    /** The size of the queue */
    get length(): number { return this.num };

    /** Adds and item to the queue */
    add(value: T) {
        this.last = this.last.next = new QueueItem<T>(value, null);
        if (this.num + 1 > this.size) {
            this.first = this.first.next;
        }
        else {
            this.num++;
        }
    }

    /** Adds the items in the queue to an Array */
    toArray(): T[] {
        var i = 0;
        var result = new Array(this.length);
        var selected = this.first;
        while((selected = selected.next)) {
            result[i++] = selected.value;
        }
        return result;
    }

    /** Sorts the queue and returns the sorted array */
    sort(callback: (a: T, b: T) => number): T[] {
        return this.toArray().sort(callback);
    }

    /** Iterates over the queue */
    map(callback: (value: T, index: number, array: T[]) => T[]) {
        return this.toArray().map(callback);
    }

    /** Iterates over the queue until true */
    some(predicate: (value: T) => boolean): boolean {
        var selected = this.first;
        while((selected = selected.next)) {
            if (predicate(selected.value)) {
                return true;
            }
        }
        return false;
    }

    /** Iterates over the queue, filtering the result */
    filter(predicate: (value: T) => boolean): T[] {
        var result = [];
        var selected = this.first;
        while((selected = selected.next)) {
            if (predicate(selected.value)) {
                result.push(selected.value);
            }
        }
        return result;
    }

    modify(iterator: (value: T) => T) {
        var selected = this.first;
        while((selected = selected.next)) {
            selected.value = iterator(selected.value)
        }
    }
}

export default Queue;