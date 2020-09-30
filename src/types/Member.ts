export type Member = {
  id: number;
  name: string;
  joined: string;
  type: string;
  discord?: string;
};

export type GQLMember = {
  _id: string;
} & Member;
