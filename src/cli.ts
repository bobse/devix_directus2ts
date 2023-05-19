#!/usr/bin/env node

import { resolve } from "path";

import axios from "axios";
import { createTsFile, simplifySpec, writeSpecFile } from "./lib.js";
import openApiTs, { OpenAPI3 } from "openapi-typescript";
import yargs from "yargs";
import { z } from "zod";

const Argv = z.object({
  host: z.string(),
  token: z.string(),
  typeName: z.string(),
  specOutFile: z.string().nullish(),
  outFile: z.string(),
  simplified: z.boolean().nullish(),
  prefix: z.string(),
});

type Argv = z.infer<typeof Argv>;

const main = async (): Promise<void> => {
  const argv = Argv.parse(
    await yargs(process.argv.slice(2))
      .option(`host`, {
        demandOption: true,
        type: `string`,
        description: "Host where the directus api is hosted",
      })
      .option(`token`, {
        demandOption: true,
        type: `string`,
        description:
          "Access token to the api. Typing will be based on the permissions enabled to this token.",
      })
      .option(`typeName`, {
        demandOption: true,
        type: `string`,
        description: "Name to group all collections inside a global type",
      })
      .option(`specOutFile`, {
        demandOption: false,
        type: `string`,
        description: "Optional path to write the OpenAPI spec file",
      })
      .option(`outFile`, {
        demandOption: true,
        type: `string`,
        description: "Path to write the .ts output file",
      })
      .option(`simplified`, {
        demandOption: false,
        type: `boolean`,
        description: "Simplify types by removing directus system collections",
      })
      .option(`prefix`, {
        demandOption: false,
        type: `string`,
        description: "Optional prefix added to every collection type",
        default: "",
      })
      .help().argv
  );

  const { host, token, simplified, typeName, specOutFile, outFile, prefix } =
    argv;

  const response = await axios.get(`${host}/server/specs/oas`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let spec: any = response.data;

  if (simplified) {
    spec = simplifySpec(spec);
  }

  if (specOutFile) {
    const spec_path = resolve(process.cwd(), specOutFile);
    await writeSpecFile(spec_path, spec);
  }

  const baseSource = await openApiTs(spec as OpenAPI3, {
    commentHeader: "",
  });

  const ts_path = resolve(process.cwd(), outFile);
  createTsFile(typeName, baseSource, ts_path, prefix);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
