"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rwi = exports.iwi = exports.smartClean = exports.smartCopy = exports.implosion = exports.stringBetweenStrings = exports.replaceWithIndent = exports.insertWithIndent = exports.addIndents = void 0;
const path_1 = __importDefault(require("path"));
const promiseman_1 = require("promiseman");
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
function stringBetweenStrings(startStr, endStr, str) {
    let pos = str.indexOf(startStr) + startStr.length;
    return str.substring(pos, str.indexOf(endStr, pos));
}
exports.stringBetweenStrings = stringBetweenStrings;
// Remove the lines containing "str" and spaces(indents).
function implosion(txt, str) {
    const lines = txt.split('\n');
    const filteredLines = lines.filter(line => !line.trim().startsWith(str) || line.trim().replace(str, '').trim().length > 0);
    return filteredLines.join('\n');
}
exports.implosion = implosion;
/**
 * Копирует исходники из папки template/main в папку проекта (release),
 * однако не трогает определенные файлы и папки
 **/
async function smartCopy(sourceDir, targetDir, ignoreList) {
    const files = await (0, promiseman_1.readdir)(sourceDir);
    for (const file of files) {
        if (ignoreList.includes(file)) {
            continue;
        }
        const filePath = `${sourceDir}/${file}`;
        const targetPath = `${targetDir}/${file}`;
        const stats = await (0, promiseman_1.stat)(filePath);
        if (stats.isDirectory()) {
            await (0, promiseman_1.mkdir)(targetPath, { recursive: true });
            await smartCopy(filePath, targetPath, ignoreList);
        }
        else {
            await (0, promiseman_1.copyFile)(filePath, targetPath);
        }
    }
}
exports.smartCopy = smartCopy;
// Удаление папки и всего содержимого рекурсивно?
async function deleteFolderRecursive(folderPath) {
    let files = [];
    try {
        files = await (0, promiseman_1.readdir)(folderPath);
    }
    catch (err) {
        // Если папка не существует, просто выходим из функции
        return;
    }
    for (const file of files) {
        const curPath = path_1.default.join(folderPath, file);
        try {
            const stats = await (0, promiseman_1.lstat)(curPath);
            if (stats.isDirectory()) {
                // Рекурсивный вызов для удаления поддиректорий
                await deleteFolderRecursive(curPath);
            }
            else {
                // Удаление файла
                await (0, promiseman_1.unlink)(curPath);
            }
        }
        catch (err) {
            console.error(err);
        }
    }
    // Удаление самой папки
    try {
        await (0, promiseman_1.rmdir)(folderPath);
    }
    catch (err) {
        console.error(err);
    }
}
/**
 * Чистит папку однако не трогает определенные файлы и папки
 * и не трогает саму папку
 **/
async function smartClean(dir, ignore) {
    // const releaseFolderPath = path.resolve(pathToRelease);
    try {
        // Читаем содержимое папки "release"
        const files = await (0, promiseman_1.readdir)(dir);
        // Проходимся по каждому файлу/папке
        for (const file of files) {
            const filePath = path_1.default.join(dir, file);
            // Проверяем, является ли текущий файл/папка папкой "data" или файлом ".env"
            if (!ignore?.some((x) => x === file)) {
                // Получаем информацию о текущем файле/папке
                const stats = await (0, promiseman_1.lstat)(filePath);
                if (stats.isFile()) {
                    // Если это файл, то удаляем его
                    await (0, promiseman_1.unlink)(filePath);
                }
                else if (stats.isDirectory()) {
                    // Если это папка, то удаляем ее и все ее содержимое рекурсивно
                    await deleteFolderRecursive(filePath);
                }
            }
        }
    }
    catch (error) {
        console.error(`Failed to delete content in ${dir}: ${error}`);
    }
}
exports.smartClean = smartClean;
