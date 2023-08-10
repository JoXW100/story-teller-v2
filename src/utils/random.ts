// Credit: Makoto Matsumoto and Takuji Nishimura's code
class Random {
    private static readonly MATRIX_A: number = 0x9908b0df;
    private static readonly UPPER_MASK: number = 0x80000000;
    private static readonly LOWER_MASK: number = 0x80000000;
    private readonly N: number;
    private readonly M: number;
    private readonly mt: Array<number>;
    private mti: number;

    constructor(seed?: number | Array<number>) {
        if (seed == undefined) {
            seed = new Date().getTime();
        }

        /* Period parameters */
        this.N = 624;
        this.M = 397;

        this.mt = new Array(this.N); /* the array for the state vector */
        this.mti = this.N+1; /* mti==N+1 means mt[N] is not initialized */

        if (seed.constructor == Array) {
            this.init_by_array(seed, seed.length);
        } else {
            this.init_seed(seed as number);
        }
    }

    public  init_seed = (s: number) => {
        this.mt[0] = s >>> 0;
        for (this.mti = 1; this.mti < this.N; this.mti++) {
            let s = this.mt[this.mti-1] ^ (this.mt[this.mti-1] >>> 30);
            this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + this.mti;
            /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
            /* In the previous versions, MSBs of the seed affect   */
            /* only MSBs of the array mt[].                        */
            /* 2002/01/09 modified by Makoto Matsumoto             */
            this.mt[this.mti] >>>= 0;
            /* for >32 bit machines */
        }
    }

    public init_by_array = (init_key: Array<number>, key_length: number) => {
        this.init_seed(19650218);
        var i = 0;
        var j = 0; 
        var k = (this.N > key_length ? this.N : key_length);
        for (; k; k--) {
            let s = this.mt[i-1] ^ (this.mt[i-1] >>> 30)
            this.mt[i] = this.mt[i] ^ ((((s & 0xffff0000) >>> 16) * 1664525) << 16) + (s & 0x0000ffff) * 1664525
            + init_key[j] + j; /* non linear */
            this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
            i++; j++;
            if (i>=this.N) { this.mt[0] = this.mt[this.N-1]; i=1; }
            if (j>=key_length) j=0;
        }
        for (k = this.N - 1; k; k--) {
            let s = this.mt[i-1] ^ (this.mt[i-1] >>> 30);
            this.mt[i] = this.mt[i] ^ ((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941
            - i; /* non linear */
            this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
            i++;
            if (i >= this.N) { 
                this.mt[0] = this.mt[this.N - 1]; i=1; 
            }
        }
    
        this.mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */
    }
    
    public random_int = (): number => {
        var y: number;
        var mag01 = new Array(0x0, Random.MATRIX_A);
        /* mag01[x] = x * MATRIX_A  for x=0,1 */
    
        if (this.mti >= this.N) { /* generate N words at one time */
            let kk: number;
            
            /* if init_seed() has not been called, */
            if (this.mti == this.N+1)  
                this.init_seed(new Date().getTime());
    
            for (kk=0;kk<this.N-this.M;kk++) {
                y = (this.mt[kk]&Random.UPPER_MASK)|(this.mt[kk+1]&Random.LOWER_MASK);
                this.mt[kk] = this.mt[kk+this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            for (;kk<this.N-1;kk++) {
                y = (this.mt[kk]&Random.UPPER_MASK)|(this.mt[kk+1]&Random.LOWER_MASK);
                this.mt[kk] = this.mt[kk+(this.M-this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            y = (this.mt[this.N-1]&Random.UPPER_MASK)|(this.mt[0]&Random.LOWER_MASK);
            this.mt[this.N-1] = this.mt[this.M-1] ^ (y >>> 1) ^ mag01[y & 0x1];
    
            this.mti = 0;
        }
    
        y = this.mt[this.mti++];
    
        /* Tempering */
        y ^= (y >>> 11);
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= (y >>> 18);
    
        return y >>> 0;
    }

    /** @description generates a random number on [0,0x7fffffff]-interval */
    public random_int31 = (): number => {
        return this.random_int() >>> 1;
    }
    
    /** @description generates a random number on [0,1]-real-interval */
    public random_incl = (): number => {
        return this.random_int() * (1.0/4294967295.0);
        /* divided by 2^32-1 */
    }
    
    /** @description generates a random number on [0,1)-real-interval */
    public random = (): number => {
        return this.random_int() * (1.0/4294967296.0);
        /* divided by 2^32 */
    }
    
    /** @description generates a random number on (0,1)-real-interval */
    public random_excl = (): number => {
        return (this.random_int() + 0.5) * (1.0/4294967296.0);
        /* divided by 2^32 */
    }
    
    /** @description generates a random number on [0,1) with 53-bit resolution*/
    public random_long = (): number => {
        let a= this.random_int() >>> 5;
        let b = this.random_int() >>> 6;
        return (a * 67108864.0 + b) * (1.0/9007199254740992.0);
    }
}

export default Random;