import client from './db';
import { gql } from 'graphql-request';
import { Member } from '../types/Member';

export const getMemberById = async (id: number): Promise<Member> => {
  const query = gql`
    query MemberQuery($id: Int!) {
      member: memberById(id: $id) {
        id
        name
        joined
        type
      }
    }
  `;

  const variables = { id };

  const data = await client.request<{ member: Member }, { id: number }>(query, variables);

  return data.member;
};

export const addMember = async (member: Member): Promise<undefined> => {
  try {
    const query = gql`
      mutation AddMemberMutation($id: Int!, $name: String!, $type: String!, $joined: String!) {
        createMember(data: { id: $id, name: $name, type: $type, joined: $joined }) {
          id
        }
      }
    `;

    await client.request<{ id: number }, Member>(query, member);
    return;
  } catch (e) {
    if (e.message.substr(0, 23) === 'Instance is not unique.') {
      return;
    }
    throw e;
  }
};
