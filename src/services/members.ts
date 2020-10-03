import { GQLMember, Member } from '../types/Member';
import _ from 'lodash';
import client from './db';
import { gql } from 'graphql-request';
import { Optional } from '../types/utils';
import { Snowflake } from 'discord.js';

export const getMemberById = async (id: number): Promise<Optional<Member>> => {
  const query = gql`
    query MemberQuery($id: Int!) {
      member: memberById(id: $id) {
        id
        name
        joined
        type
        discord
      }
    }
  `;

  const variables = { id };

  const data = await client.request<{ member: Member }, { id: number }>(query, variables);

  return data.member;
};

export const getMemberByDiscord = async (discord: Snowflake): Promise<Optional<Member>> => {
  try {
    const query = gql`
      query MemberQuery($discord: String!) {
        member: memberByDiscord(discord: $discord) {
          id
          name
          joined
          type
          discord
        }
      }
    `;

    const { member } = await client.request<{ member: Member }, { discord: string }>(query, { discord });

    return member;
  } catch (e) {
    throw e;
  }
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

    const { member: newMember } = await client.request<{ member: Member }, GQLMember>(updateQuery, {
      ...{ ...originalMember, ...member },
    });

    return newMember;
  } catch (e) {
    throw e;
  }
};
