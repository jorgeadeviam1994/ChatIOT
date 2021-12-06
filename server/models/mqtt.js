const mongoose = require('mongoose'); // Utilizamos la librería de mongoose
const { Schema } = mongoose;
//Creamos la conexión con mongo
const mqttSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  client: String,
  topic: String,
  message: String,
  created: { 
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('mqttModel', mqttSchema);
