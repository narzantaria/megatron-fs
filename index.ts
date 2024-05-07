import { IField } from "./types";
import { read } from "./promises";

const MODELS_FOLDER = `${process.cwd()}/models`;

// Read universal schema
export async function readSchema(arg: string): Promise<IField[] | null> {
  try {
    const rawData = await read(`${MODELS_FOLDER}/${arg}.json`, "utf8");
    if (!rawData) return null;
    const data: IField[] = JSON.parse(rawData);
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
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

export { insertWithIndent as iwi, replaceWithIndent as rwi }