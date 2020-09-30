import { addMemberIfChanged, getAllMembers } from '../services/members';
import { addMember as addMemberToStore } from '../store/members';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Member } from '../types/Member';
import store from '../store';

let su_session = process.env.su_session;
const matchCookies = /(\w*=\w*)/g;

const getCookie = (cookies: string) =>
  [...cookies.matchAll(matchCookies)]
    .map(([cookie]) => cookie.split('='))
    .filter((cookie) => cookie[0] === 'su_session' && cookie[1] !== 'deleted')
    .map((cookie) => cookie[1]);

export const sync = async (start = false): Promise<void> => {
  try {
    if (start) {
      const allMembers = await getAllMembers();

      for (const member of allMembers) {
        store.dispatch(addMemberToStore(member));
      }
    }

    const body = await fetch(process.env.sumsUrl as string, {
      headers: {
        Cookie: `su_session=${su_session};`,
      },
    }).then((res) => {
      console.log(res.headers.get('set-cookie'));
      const newSuSession = getCookie(res.headers.get('set-cookie') as string);
      if (newSuSession[0]) {
        su_session = newSuSession[0];
        console.log('su_session set to', newSuSession[0]);
      }
      return res.text();
    });

    const dom = new JSDOM(body);

    const members = [...dom.window.document.querySelectorAll('#group-member-list-datatable > tbody > tr')].map(
      (row) => ({
        id: parseInt((row.children.item(0) as Element).innerHTML),
        name: (row.children.item(1) as Element).innerHTML,
        type: (row.children.item(2) as Element).innerHTML,
        joined: new Date((row.children.item(4) as Element).innerHTML).toString(),
      }),
    );

    members.forEach((member) => addMemberIfChanged(member as Member));
    console.log('Found', members.length, 'members.');
  } catch (e) {
    throw e;
  }
};
