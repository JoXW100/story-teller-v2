
/** Compares two arrays and returns if they contain equivalent elements */
export const arraysAreEqual = (a: any[], b: any[]): boolean => {
    if (a.length !== b.length)
        return false;
    
    for (let index = 0; index < a.length; index++) {
        if (a[index] !== b[index])
            return false;
    }

    return true;
}