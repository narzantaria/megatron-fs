import path from "path";
import { copyFile, lstat, mkdir, read, readdir, rmdir, stat, unlink } from "promiseman";

export type TType =
  | "int"
  | "double"
  | "string"
  | "description"
  | "text"
  | "code"
  | "json"
  | "password"
  | "phone"
  | "phonex"
  | "email"
  | "select"
  | "radio"
  | "img"
  | "gallery"
  | "video"
  | "checkbox"
  | "tags"
  | "color"
  | "switch"
  | "date"
  | "vendor"
  | "complex"
  | "multiselect"
  | "relation";

export interface IObject {
  [key: string]: any;
}

export interface StepLevel {
  name: string;
  label: string;
}

export interface IField extends IObject {
  name: string;
  label?: string;
  type: TType;
  required?: boolean;
  schema?: "one-to-one" | "one-to-many" | "many-to-many" | "many-to-many-bi";
  level?: "host" | "recipient" | "side";
  ref?: string;
  refname?: string;
  unique?: boolean;
  array?: boolean;
  nocascade?: boolean;
  extra?: any;
  default?: any;
  steps?: StepLevel[];
}

export interface Model {
  name: string;
  data: string;
}

function repeatStr(str: string, length: number): string {
  return length > 0 && str.length
    ? Array.from({ length })
      .map(() => str)
      .reduce((a, b) => a + b)
    : "";
}

// Get indents before
function getIndents(data: string, marker: string): number {
  const serializedData = JSON.stringify(data);
  const indexOfSubstring = serializedData.indexOf(marker);
  const textBefore = serializedData.slice(0, indexOfSubstring);
  const lastN = textBefore.lastIndexOf("\\n");
  return textBefore.length - lastN - 2;
}


export function addIndents(data: string, indent: number): string {
  const str = JSON.stringify(data);
  const formatted = str.replace(/\\n/g, "\\n" + repeatStr(" ", indent));
  return JSON.parse(formatted);
}

// Insert code below marker
export function insertWithIndent(
  data: string,
  code: string,
  marker: string,
): string {
  const indent = getIndents(data, marker);
  const codeWithIndents = addIndents(code, indent);
  const result = data.replace(
    marker,
    marker + "\n" + repeatStr(" ", indent) + codeWithIndents,
  );
  return result;
}

// Replace marker with code
export function replaceWithIndent(
  data: string,
  code: string,
  marker: string,
): string {
  const indent = getIndents(data, marker);
  const codeWithIndents = addIndents(code, indent);
  const result = data.replace(marker, codeWithIndents);
  return result;
}

export function stringBetweenStrings(
  startStr: string,
  endStr: string,
  str: string
): string {
  let pos = str.indexOf(startStr) + startStr.length;
  return str.substring(pos, str.indexOf(endStr, pos));
}

// Remove the lines containing "str" and spaces(indents).
export function implosion(txt: string, str: string): string {
  const lines = txt.split('\n');
  const filteredLines = lines.filter(line => !line.trim().startsWith(str) || line.trim().replace(str, '').trim().length > 0);
  return filteredLines.join('\n');
}

/**
 * Копирует исходники из папки template/main в папку проекта (release),
 * однако не трогает определенные файлы и папки
 **/
export async function smartCopy(sourceDir: string, targetDir: string, ignoreList: string[]) {
  const files = await readdir(sourceDir);

  for (const file of files) {
    if (ignoreList.includes(file)) {
      continue;
    }

    const filePath = `${sourceDir}/${file}`;
    const targetPath = `${targetDir}/${file}`;

    const stats = await stat(filePath);

    if (stats.isDirectory()) {
      await mkdir(targetPath, { recursive: true });
      await smartCopy(filePath, targetPath, ignoreList);
    } else {
      await copyFile(filePath, targetPath);
    }
  }
}

// Удаление папки и всего содержимого рекурсивно?
async function deleteFolderRecursive(folderPath: string) {
  let files = [];

  try {
    files = await readdir(folderPath);
  } catch (err) {
    // Если папка не существует, просто выходим из функции
    return;
  }

  for (const file of files) {
    const curPath = path.join(folderPath, file);

    try {
      const stats = await lstat(curPath);
      if (stats.isDirectory()) {
        // Рекурсивный вызов для удаления поддиректорий
        await deleteFolderRecursive(curPath);
      } else {
        // Удаление файла
        await unlink(curPath);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Удаление самой папки
  try {
    await rmdir(folderPath);
  } catch (err) {
    console.error(err);
  }
}

/**
 * Чистит папку однако не трогает определенные файлы и папки
 * и не трогает саму папку
 **/
export async function smartClean(dir: string, ignore?: string[]) {
  // const releaseFolderPath = path.resolve(pathToRelease);

  try {
    // Читаем содержимое папки "release"
    const files = await readdir(dir);

    // Проходимся по каждому файлу/папке
    for (const file of files) {
      const filePath = path.join(dir, file);

      // Проверяем, является ли текущий файл/папка папкой "data" или файлом ".env"
      if (!ignore?.some((x) => x === file)) {
        // Получаем информацию о текущем файле/папке
        const stats = await lstat(filePath);

        if (stats.isFile()) {
          // Если это файл, то удаляем его
          await unlink(filePath);
        } else if (stats.isDirectory()) {
          // Если это папка, то удаляем ее и все ее содержимое рекурсивно
          await deleteFolderRecursive(filePath);
        }
      }
    }
  } catch (error) {
    console.error(`Failed to delete content in ${dir}: ${error}`);
  }
}

export { insertWithIndent as iwi, replaceWithIndent as rwi }