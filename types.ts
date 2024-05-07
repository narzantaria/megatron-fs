export type TType =
  | "int"
  | "double"
  | "string"
  | "description"
  | "text"
  | "code"
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