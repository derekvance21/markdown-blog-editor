const MongoClient = require("mongodb").MongoClient;
const options = { useUnifiedTopology: true, writeConcern: { j: true } };
let client = null;
const dbName = "BlogServer";

// create a connection to url and call callback()
function connect(url, callback) {
  if (client == null) {
    // create a mongodb client
    client = new MongoClient(url, options);
    // establish a new connection
    client.connect((err) => {
      if (err) {
        // error occurred during connection
        client = null;
        callback(err);
      } else {
        // all done
        callback();
      }
    });
  } else {
    // connection was established earlier. just call callback()
    callback();
  }
}

function collection(collectionName) {
  return client.db(dbName).collection(collectionName);
}

// close open connection
function close() {
  if (client) {
    client.close();
    client = null;
  }
}

// export connect(), db() and close() from the module
module.exports = {
  connect,
  collection,
  close,
};
