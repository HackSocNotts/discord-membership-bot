import './configEnv';
import './bot';
import { sync } from './services/sums';

sync(true);
setInterval(sync, 5 * 60 * 1000);
