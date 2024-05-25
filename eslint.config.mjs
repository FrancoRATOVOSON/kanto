// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import perfectionist from 'eslint-plugin-perfectionist'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import { FlatCompat } from '@eslint/eslintrc'
import path from 'node:path'
import url from 'node:url'

const compat = new FlatCompat({
  baseDirectory: path.dirname(url.fileURLToPath(import.meta.url))
})

export default [
  eslint.configs.recommended,
  ...compat.extends('eslint-config-standard'),
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      perfectionist
    },
    rules: {
      'perfectionist/sort-classes': [
        'warn',
        {
          type: 'natural',
          order: 'asc',
          groups: [
            'index-signature',
            'static-property',
            'private-property',
            'property',
            'constructor',
            'static-method',
            'private-method',
            'method'
          ]
        }
      ],
      'perfectionist/sort-interfaces': [
        'warn',
        {
          type: 'natural',
          order: 'asc'
        }
      ]
    }
  },
  {
    rules: {
      'prettier/prettier': 'warn'
    }
  }
]
