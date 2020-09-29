import './configEnv';
import { sync } from './services/sums';

setInterval(sync, 5 * 60 * 1000);
