// TODO: This is missing annotation support everywhere.

import { FastPath, Doc, doc } from 'prettier';
import {
  BaseType,
  Comment,
  ConstDefinition,
  EnumDefinition,
  UnionDefinition,
  EnumMember,
  FieldDefinition,
  IncludeDefinition,
  FieldID,
  Identifier,
  ListType,
  MapType,
  IntConstant,
  NamespaceDefinition,
  StringLiteral,
  StructDefinition,
  ThriftDocument,
  TypedefDefinition,
} from '@creditkarma/thrift-parser';

const { join, concat, hardline, softline, indent, group } = doc.builders;

type Node =
  | BaseType
  | ListType
  | MapType
  | Comment
  | ConstDefinition
  | EnumDefinition
  | EnumMember
  | FieldDefinition
  | IncludeDefinition
  | UnionDefinition
  | FieldID
  | Identifier
  | IntConstant
  | NamespaceDefinition
  | StringLiteral
  | StructDefinition
  | ThriftDocument
  | TypedefDefinition;

export default function genericPrint(
  // Path to the AST node to print
  path: FastPath,
  options: object,
  // Recursively print a child node
  print: (path: FastPath) => Doc,
): Doc {
  const node: Node = path.getValue();

  if (!node) {
    return '';
  }

  switch (node.type) {
    case 'IncludeDefinition':
      return concat([
        ...path.map(print, 'comments'),
        concat(['include "', node.path.value, '"'])
      ]);

    case 'CommentBlock':
      return concat([
        '/**',
        hardline,
        ...node.value.map((comment) => ` * ${comment}\n`),
        ' */',
        hardline,
      ]);

    case 'ExceptionDefinition':
    case 'ServiceDefinition':
      return 'TODO';

    case 'ThriftDocument':
      return concat([
        join(concat([hardline, hardline]), path.map(print, 'body')),
        hardline,
      ]);

    case 'NamespaceDefinition':
      return concat([
        ...path.map(print, 'comments'),
        'namespace ',
        node.scope.value,
        ' ',
        node.name.value,
      ]);

    case 'ConstDefinition':
      return concat([
        ...path.map(print, 'comments'),
        'const ',
        path.call(print, 'fieldType'),
        ' ',
        node.name.value,
        ' = ',
        path.call(print, 'initializer'),
      ])

    case 'ListType':
      return concat(['list<', path.call(print, 'valueType'), '>']);

    case 'MapType':
      return concat([
        'map<',
        path.call(print, 'keyType'),
        ', ',
        path.call(print, 'valueType'),
        '>',
      ]);

    case 'TypedefDefinition':
      return concat([
        ...path.map(print, 'comments'),
        'typedef ',
        path.call(print, 'definitionType'),
        ' ',
        node.name.value,
      ]);

    case 'EnumDefinition':
      return group(
        concat([
          'enum ',
          node.name.value,
          ' {',
          indent(
            concat([softline, join(hardline, path.map(print, 'members'))]),
          ),
          softline,
          '}',
        ]),
      );

    case 'StructDefinition':
    case 'UnionDefinition':
      return group(
        concat([
          node.type === 'StructDefinition' ? 'struct ' : 'union ',
          node.name.value,
          ' {',
          indent(concat([softline, join(hardline, path.map(print, 'fields'))])),
          softline,
          '}',
        ]),
      );

    case 'FieldDefinition': {
      const defaultValue = node.defaultValue
        ? [' = ', path.call(print, 'defaultValue')]
        : [];

      const requiredness = [];
      if (node.requiredness === 'required') requiredness.push('required ');
      if (node.requiredness === 'optional') requiredness.push('optional ');

      return concat([
        ...path.map(print, 'comments'),
        path.call(print, 'fieldID'),
        ': ',
        ...requiredness,
        path.call(print, 'fieldType'),
        ' ',
        node.name.value,
        ...defaultValue,
        ';',
      ]);
    }

    case 'FieldID':
      return String(node.value);

    case 'EnumMember': {
      const initializer = node.initializer
        ? [concat([' = ', path.call(print, 'initializer')])]
        : [];

      return concat([
        ...path.map(print, 'comments'),
        node.name.value,
        ...initializer,
      ]);
    }

    case 'CommentLine':
      return concat([`# ${node.value}`, hardline]);

    case 'StringLiteral':
      return `"${node.value}"`;
    case 'Identifier':
      return node.value;
    case 'IntConstant':
      return node.value.value;

    // Keywords:
    case 'I16Keyword':
      return 'i16';
    case 'I32Keyword':
      return 'i32';
    case 'I64Keyword':
      return 'i64';
    case 'StringKeyword':
      return 'string';
    case 'DoubleKeyword':
      return 'double';
    case 'BoolKeyword':
      return 'bool';

    default:
      if (process.env.NODE_ENV === 'test') {
        throw new Error(
          'Unknown Thrift node: ' +
            JSON.stringify(node, null /*replacer*/, 4 /*space*/),
        );
      }
      // eslint-disable-next-line no-console
      console.error('Unknown Thrift node:', node);
      return '';
  }
}
