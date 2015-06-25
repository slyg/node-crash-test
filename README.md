# node-crash-test

Sandbox to play with node's cluster, domains and uncaught exceptions handling.

### Install, launch and crash

`npm i && npm start`

See OK page at `http://localhost:4000/`.

To trigger an uncaught exception :
- always: `/crash`
- with a probability of 5%, `/crash/sometimes`
