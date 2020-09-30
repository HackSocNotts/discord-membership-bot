import { GQLMember, Member } from '../types/Member';
import _ from 'lodash';
import client from './db';
import { gql } from 'graphql-request';

const members: { [key: number]: Member } = {};

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

export const getAllMembers = async (): Promise<Member[]> => {
  try {
    const query = gql`
      query GetAllMembersQuery {
        allMembers(_size: 1000) {
          members: data {
            id
            name
            joined
            type
            discord
          }
        }
      }
    `;

    const {
      allMembers: { members },
    } = await client.request<{ allMembers: { members: Member[] } }>(query);

    return members;
  } catch (e) {
    throw e;
  }
};

export const addMember = async (member: Member): Promise<Member> => {
  try {
    const query = gql`
      mutation AddMemberMutation($id: Int!, $name: String!, $type: String!, $joined: String!) {
        member: createMember(data: { id: $id, name: $name, type: $type, joined: $joined }) {
          id
          name
          type
          joined
          discord
        }
      }
    `;

    const { member: savedMember } = await client.request<{ member: Member }, Member>(query, member);
    return savedMember;
  } catch (e) {
    if (e.message.substr(0, 23) === 'Instance is not unique.') {
      return member;
    }
    throw e;
  }
};

export const addMemberIfChanged = async (member: Member): Promise<Member> => {
  try {
    if (!members[member.id]) {
      const savedMember = await addMember(member);
      members[savedMember.id] = savedMember;
      return savedMember;
    }

    if (!_.isEqual(members[member.id], member)) {
      const savedMember = await updateMember(member.id, member);
      members[savedMember.id] = savedMember;
      return savedMember;
    }

    return members[member.id];
  } catch (e) {
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
      mutation UpdateMemberMutation(
        $_id: ID!
        $id: Int!
        $name: String!
        $type: String!
        $joined: String!
        $discord: String
      ) {
        member: updateMember(
          id: $_id
          data: { id: $id, name: $name, type: $type, joined: $joined, discord: $discord }
        ) {
          id
          name
          type
          joined
          discord
        }
      }
    `;

    console.log('_id: ', originalMember._id, 'data: ', { ...originalMember, ...member });

    const { member: newMember } = await client.request<{ member: Member }, GQLMember>(updateQuery, {
      ...{ ...originalMember, ...member },
    });

    return newMember;
  } catch (e) {
    throw e;
  }
};
