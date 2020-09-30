import { addMember, updateMember } from './actions';
import { createReducer } from '@reduxjs/toolkit';
import { Member } from '../../types/Member';

export interface MembersInitialState {
  [key: number]: Member;
}

const reducer = createReducer<MembersInitialState>({}, (builder) =>
  builder
    .addCase(addMember, (state, { payload: member }) => ({
      ...state,
      [member.id]: {
        ...member,
      },
    }))
    .addCase(updateMember, (state, { payload: member }) => ({
      ...state,
      [member.id]: {
        ...state[member.id],
        ...member,
      },
    })),
);

export default reducer;
