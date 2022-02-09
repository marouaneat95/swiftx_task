require('dotenv').config();

const server = require('./server');

const PORT = 3300;

server.listen(PORT, () => console.log(`Server is live at localhost:${PORT}`));