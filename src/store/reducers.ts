import { combineReducers } from '@reduxjs/toolkit';
import { reducer as MembersReducer } from './members';

export const reducers = combineReducers({
  members: MembersReducer,
});

export default reducers;
