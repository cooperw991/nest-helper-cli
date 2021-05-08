#!/bin/bash

rm -rf dist

pnpm install

pnpm run build

cp package.json dist/package.json

chmod -R +x dist
