import { snakeCase } from "change-case";
import { writeFile } from "fs/promises";

export const simplifySpec = (spec: any) => {
  delete spec.components.parameters;
  delete spec.components.tags;
  delete spec.components.responses;
  delete spec.components.securitySchemes;
  delete spec.components.Auth;
  delete spec.components.schemas.Query;
  delete spec.components.schemas.Activity;
  delete spec.components.schemas.Collections;
  delete spec.components.schemas.Fields;
  delete spec.components.schemas.Permissions;
  delete spec.components.schemas.Presets;
  delete spec.components.schemas.Relations;
  delete spec.components.schemas.Revisions;
  delete spec.components.schemas.Settings;
  delete spec.components.schemas.Operations;
  delete spec.components.schemas.Webhooks;
  delete spec.components.schemas.Flows;
  delete spec.components.schemas["x-metadata"];
  delete spec.operations;
  delete spec.external;
  delete spec.webhooks;
  delete spec.paths;
  return spec;
};

export const writeSpecFile = async (filename: string, spec: any) => {
  await writeFile(filename, JSON.stringify(spec, null, 2), {
    encoding: `utf-8`,
  });
};

export const defaultItemPattern = /^    Items([^\:]*)/;

export const getExportProperties = (
  baseSource: string,
  prefix: string,
  itemPattern: RegExp = defaultItemPattern
) =>
  baseSource
    .split(`\n`)
    .map((line) => {
      const match = line.match(itemPattern);
      if (!match) {
        return null;
      }
      const [, collectionName] = match;
      const propertyKey = snakeCase(collectionName);
      return `  ${propertyKey}: components["schemas"]["${prefix}${collectionName}"];`;
    })
    .filter((line): line is string => typeof line === `string`)
    .join(`\n`);

export const createTsFile = async (
  typeName: string,
  baseSource: string,
  outputFile: string,
  prefix: string
) => {
  const exportProperties = getExportProperties(baseSource, prefix);
  const exportSource = `export type ${typeName} = {\n${exportProperties}\n};`;

  const header = "/** \n Arquivo gerado automaticamente pelo Directus2TS \n */";
  const source = [header, exportSource, baseSource].join(`\n`);

  await writeFile(outputFile, source, {
    encoding: `utf-8`,
  });
};
