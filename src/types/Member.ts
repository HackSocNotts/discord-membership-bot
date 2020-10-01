import { Nullable } from './utils';

export type Member = {
  id: number;
  name: string;
  joined: string;
  type: string;
  discord?: Nullable<string>;
};

export type GQLMember = {
  _id: string;
} & Member;
