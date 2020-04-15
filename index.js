const AWS = require("aws-sdk");

AWS.config.getCredentials(function (err) {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log("Access key:", AWS.config.credentials.accessKeyId);
    console.log("Secret access key:", AWS.config.credentials.secretAccessKey);
    console.log("Region", AWS.config);
  }
});
AWS.config.update({
  region: "us-east-2",
});
const documentClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing movies into DynamoDB. Please wait.");

const params = {
  TableName: "warStats",
  Item: {
    tag: "#testing12345",
    warNumber: "12",
    name: "lmfaoss",
    cardsEarned: "asdsdassa",
    battlesPlayed: "Asasdasdd",
    wins: "asdsadaa",
    collectionDayBattlePlayed: "sadsadsa",
    numberOfBattles: "assadad",
  },
};

documentClient.put(params, function (err, data) {
  if (err) {
    console.error(
      "Unable to add ",

      ". Error JSON:",
      JSON.stringify(err, null, 2)
    );
  } else {
    console.log("PutItem succeeded:");
  }
});
