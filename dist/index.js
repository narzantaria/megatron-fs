"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rwi = exports.iwi = exports.replaceWithIndent = exports.insertWithIndent = exports.addIndents = exports.readSchema = void 0;
const promises_1 = require("./promises");
const MODELS_FOLDER = `${process.cwd()}/models`;
// Read universal schema
async function readSchema(arg) {
    try {
        const rawData = await (0, promises_1.read)(`${MODELS_FOLDER}/${arg}.json`, "utf8");
        if (!rawData)
            return null;
        const data = JSON.parse(rawData);
        return data;
    }
    catch (error) {
        console.log(error);
        return null;
    }
}
exports.readSchema = readSchema;
function repeatStr(str, length) {
    return length > 0 && str.length
        ? Array.from({ length })
            .map(() => str)
            .reduce((a, b) => a + b)
        : "";
}
// Get indents before
function getIndents(data, marker) {
    const serializedData = JSON.stringify(data);
    const indexOfSubstring = serializedData.indexOf(marker);
    const textBefore = serializedData.slice(0, indexOfSubstring);
    const lastN = textBefore.lastIndexOf("\\n");
    return textBefore.length - lastN - 2;
}
function addIndents(data, indent) {
    const str = JSON.stringify(data);
    const formatted = str.replace(/\\n/g, "\\n" + repeatStr(" ", indent));
    return JSON.parse(formatted);
}
exports.addIndents = addIndents;
// Insert code below marker
function insertWithIndent(data, code, marker) {
    const indent = getIndents(data, marker);
    const codeWithIndents = addIndents(code, indent);
    const result = data.replace(marker, marker + "\n" + repeatStr(" ", indent) + codeWithIndents);
    return result;
}
exports.insertWithIndent = insertWithIndent;
exports.iwi = insertWithIndent;
// Replace marker with code
function replaceWithIndent(data, code, marker) {
    const indent = getIndents(data, marker);
    const codeWithIndents = addIndents(code, indent);
    const result = data.replace(marker, codeWithIndents);
    return result;
}
exports.replaceWithIndent = replaceWithIndent;
exports.rwi = replaceWithIndent;
