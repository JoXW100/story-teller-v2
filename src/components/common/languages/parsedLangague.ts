import { ElementDictionary } from "elements";

export default {
    // Define the token rules for your custom language
    // This is just an example and should be replaced with your actual grammar rules
    keywords: Object.keys(ElementDictionary).map(key => '\\\\' + key),
    punctuation: /[.,:;(){}[\]]/,
    numbers: /\b\d+\b/,
    string: /"(?:[^"\\]|\\.)*"/,
};