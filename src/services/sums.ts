import { addMember } from '../services/members';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Member } from '../types/Member';

let su_session = process.env.su_session;
const matchCookies = /(\w*=\w*)/g;

const getCookie = (cookies: string) =>
  [...cookies.matchAll(matchCookies)]
    .map(([cookie]) => cookie.split('='))
    .filter((cookie) => cookie[0] === 'su_session' && cookie[1] !== 'deleted')
    .map((cookie) => cookie[1]);

export const sync = async (): Promise<void> => {
  try {
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

    members.forEach((member) => addMember(member as Member));
  } catch (e) {
    throw e;
  }
};
