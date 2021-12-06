const mongoose = require('mongoose'); // Utilizamos la librería de mongoose
const URI = 'mongodb://localhost:27017/test'

//Creamos la conexión con mongo
mongoose.connect(URI, function(err, db) {
  if (err) {
    throw err;
  }
  console.log('db connected');
  //db.close();
});

module.exports = mongoose;