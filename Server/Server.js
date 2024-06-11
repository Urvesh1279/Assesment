const libexpress = require("express");
const { libutil } = require("../Util/Utils.js");
const Requestlogger = require("../middleware/Requestlogger");
const routerUi = require("../Router/Ui/Routerui.js");
const bodyparsor = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const http = require("http"); 
const WebSocket = require("ws"); 

const servermanager = {};

servermanager.prepare = () => {
  const app = libexpress();
  servermanager.server = http.createServer(app); 

  servermanager.server.use(libexpress.static("public"));

  servermanager.server.use(
    session({
      secret: process.env.SECRET_KEY,
      resave: false,
      saveUninitialized: false,
    })
  );

  servermanager.server.set("view engine", "pug");

  servermanager.server.use(cookieParser());

  servermanager.server.use(Requestlogger);

  servermanager.server.use(bodyparsor.json());

  servermanager.server.use(bodyparsor.urlencoded({ extended: true }));

  servermanager.server.use(routerUi);

  servermanager.server.use((req, res) => {
    res.status(200).json({ error: "No Such Api" });
  });


  const wss = new WebSocket.Server({ server: servermanager.server });

  wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('message', (message) => {
      console.log(`Received message: ${message}`);
      // Echo the message back to the client
      ws.send(`Server received: ${message}`);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  servermanager.wss = wss; 
};

servermanager.start = () => {
  servermanager.server.listen(process.env.PORT, () => {
    libutil.logger(
      `servermanager successfully started On Port ${process.env.PORT}. Ready to handle incoming requests.`,
      1
    );
  });
};

module.exports = servermanager;
