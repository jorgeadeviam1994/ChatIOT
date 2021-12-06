const express = require("express"); //Declara express, el framework más popular de JS
const app = express(); //Inicializa express
const path = require("path"); //Declara path, un modulo para facilitar el enturamiento en el servidor -navegar por carpetas-
const aedes = require("aedes")(); //Declara e inicializa aedes, un servidor que permite integrar MQTT, WebSocket y HTTP. 
const mqtt = require("net").createServer(aedes.handle); //Declara y crea el broker MQTT y deja que lo manipule aedes
const httpServer = require("http").createServer(app); //Declara y crea el servidor HTTP y deja que lo manipule express
const ws = require("websocket-stream"); //Declara WebSocket-stream, modulo que permite conexión abierta con el cliente y el servidor
const mqttPort = process.env.PORT || 3000; //Declara puerto para el protocolo MQTT
const appPort = process.env.PORT || 3001; //Declara puerto para el protocolo HTTP y WS (WebSocket)
const mongoose = require('mongoose');
const { mongodb } = require('./database');
const mqttModel = require('./models/mqtt');

//Se toma el broker y se le solicita escuchar por el mqttPort
mqtt.listen(mqttPort, function() {
  console.log("mqtt server listening on port", mqttPort);
});

//Se crea servidor WS y deja que lo manipule aedes sobre el protocolo HTTP
ws.createServer(
  {
    server: httpServer
  },
  aedes.handle
);

//Se toma el servidor HTTP y se le solicita que escuche por el appPort 
httpServer.listen(appPort, function() {
  console.log("server listening on port", appPort);
});

//En caso de que aedes registre un error -clienError-, muestra mensaje en consola.
aedes.on("clientError", function(client, err) {
  console.log("client error", client.id, err.message, err.stack);
});

//En caso de que aedes registre un publish -clienError-, muestra mensaje en consola.
aedes.on("publish", function(packet, client) {
  if (client) {
    console.log("message from client", client.id);
    const Object = new mqttModel ({
      _id: new mongoose.Types.ObjectId(),
      client:  client.id,
      topic: packet.topic,
      message: packet.payload.toString()
    });
    Object.save(function(err) {
      if (err) throw err;
      
      console.log('Object successfully saved.');
      });
  }
});

//En caso de que aedes registre un subscribe -clienError-, muestra mensaje en consola.
aedes.on("subscribe", function(subscriptions, client) {
  if (client) {
    console.log("subscribe from client", subscriptions, client.id);
  }
});

//En caso de que aedes registre una nueva conexión, muestra mensaje en consola.
aedes.on("client", function(client) {
  console.log("new client", client.id);
});

// Se le dice a express que utilice la ruta estatica my-app/build
app.use(express.static(path.resolve(__dirname, "../client", "build")));

// Cada vez que express escuche una solicitud GET en /, renderiza el archivo my-app/build/index.html
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
});
