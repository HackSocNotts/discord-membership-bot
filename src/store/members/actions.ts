import { createAction } from '@reduxjs/toolkit';
import { Member } from '../../types/Member';

export const addMember = createAction<Member>('ADD_MEMBER');
export const updateMember = createAction<Member>('UPDATE_MEMBER');
