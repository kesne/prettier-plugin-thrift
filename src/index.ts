import parse from './parse';
import print from './print';

export const languages = [
  {
    name: 'Thrift',
    parsers: ['thrift'],
    extensions: ['.thrift'],
    tmScope: 'source.thrift',
    aceMode: 'text',
    linguistLanguageId: 374,
    vscodeLanguageIds: ['thrift'],
  },
];

export const parsers = {
  thrift: {
    parse,
    astFormat: 'thrift-format',
    // there's only a single node
    locStart(node: any) {
      console.log(node);
      return node.loc.start;
    },
    locEnd(node: any) {
      console.log(node);
      return node.loc.end;
    },
  },
};

export const printers = {
  'thrift-format': {
    print,
  },
};

export const defaultOptions = {};
