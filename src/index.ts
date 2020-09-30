import './configEnv';
// import { sync } from './services/sums';
import { updateMember } from './services/members';

// setInterval(sync, 5 * 60 * 1000);

updateMember(14340664, { discord: '228102022933643264' }).then(console.log).catch(console.error);
