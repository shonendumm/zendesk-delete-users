import { main } from "./index.js";

// runs bulk-delete the first time this file is used.
main();

const setMins = 60000 * 5;
// calls main every 5 minutes. 60000s = 1 min
setInterval(() => {
    main();
}, setMins);