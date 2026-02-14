import { GameClient } from './GameClient.js';

const socket = io();
const params = new URLSearchParams(window.location.search);
const isController = params.get('controller') === '1';

const app = new GameClient(socket, isController);
app.initFromUrl();
