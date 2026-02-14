const { GameServer } = require('./src/server/GameServer');
const { PORT } = require('./src/server/constants');

const server = new GameServer();
server.listen(PORT);
