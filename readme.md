# Directus2Ts

Create typescript types from any directus api.
Forked from: https://github.com/elierotenberg/directus-typescript-gen

## Installation

```bash
  yarn add -D @devix-tecnologia/directus2ts
```

## Usage

```bash
yarn directus2ts --host <directus-host> --token <auth-token> --typeName <group-name> --prefix <prefix-collection> --outFile <output-file.d.ts> --simplified
```

<small>The simplified option generates a smaller file without too much pollution. It is suitable for most uses.</small>

## Instancing the Directus SDK

```ts
import { Directus } from "@directus/sdk";
import { MyCollections } from "./my-collections.d.ts";

const directus = new Directus<MyCollections>();
```
