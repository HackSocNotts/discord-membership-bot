import { GQLMember, Member } from '../types/Member';
import client from './db';
import { gql } from 'graphql-request';

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

export const updateMember = async (id: number, member: Partial<Member>): Promise<Member> => {
  try {
    const getQuery = gql`
      query GetMemberQuery($id: Int!) {
        member: memberById(id: $id) {
          _id # document id
          id # student id
          name
          type
          joined
          discord
        }
      }
    `;

    const { member: originalMember } = await client.request<{ member: GQLMember }, { id: number }>(getQuery, { id });

    const updateQuery = gql`
      mutation UpdateMemberMutation($_id: ID!, $id: Int!, $name: String!, $type: String!, $joined: !String, $discord: String) {
        member: updateMember(id: $_id, data: { id: $id, name: $name, type: $type, joined: $joined, discord: $discord }) {
          id
          name
          type
          joined
          discord
        }
      }
    `;

    const { member: newMember } = await client.request<{ member: Member }, { _id: string; data: Member }>(updateQuery, {
      _id: originalMember._id,
      data: { ...originalMember, ...member },
    });

    return newMember;
  } catch (e) {
    throw e;
  }
};
