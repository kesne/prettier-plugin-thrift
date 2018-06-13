import * as parser from '@creditkarma/thrift-parser';

export default function parse(text: string) {
  return parser.parse(text);
};
