const AWS = require("aws-sdk");
const apiCaller = require("./apiHelper.js");
const apiToken = require("./apiToken.js");

AWS.config.update({
  region: "us-east-2",
});

const documentClient = new AWS.DynamoDB.DocumentClient();
// REMEMBER to check if the war is actually done before u initiate this process due to maintenance breaks extending war day
// function checkStatus(){
//   if ()
// }

updateTable();

async function updateTable() {
  try {
    const endpoint = "https://api.clashroyale.com/v1/clans/%23LGG99U0/warlog";
    const stat = await apiCaller(endpoint, apiToken());
    const responseText = JSON.parse(stat.responseText);

    let prevWar = await prevWarNumber();
    console.log(prevWar)
    prevWar++;

    if (stat.status !== 200) {
      throw `${stat.status} ${responseText.reason}`;
    }
    for (let i of responseText.items[0].participants) {
      const dataObj = formatData(i, prevWar);
      writeData(dataObj);
    }
    const clanStats = getClanStats(responseText.items[0].standings);

    const dataObj = formatData(clanStats, prevWar);
    writeData(dataObj);
  } catch (error) {
    console.log(error);
  }
}

function writeData(params) {
  documentClient.put(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to add to",

        ". Error JSON:",
        JSON.stringify(err, null, 2)
      );
      throw err;
    } else {
      console.log("PutItem succeeded:");
    }
  });
}

function formatData(stats, warNumber) {
  stats.warNumber = warNumber;
  const warStats = {
    TableName: "warStats",
    Item: stats,
  };
  return warStats;
}

function getClanStats(clans) {
  for (i of clans) {
    if (i.clan.tag === "#LGG99U0") {
      return i.clan;
    }
  }
}

function parseDate(date) {
  d = date.replace("T", "").match(/.{2}/g);
  //return ''+d[0]+d[1] + '-' + d[2] + '-' + d[3] + ' ' + d[4] + ':' + d[5];
  var options = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  da = new Date(
    "" +
      d[0] +
      d[1] +
      "-" +
      d[2] +
      "-" +
      d[3] +
      "T" +
      d[4] +
      ":" +
      d[5] +
      ":" +
      d[6] +
      ".000z"
  );
  return da.toLocaleDateString("en-US", options);
}

async function prevWarNumber() {
  let warNum = null;

  const params = {
    TableName: "warStats",
    KeyConditionExpression: "#tag = :tag",
    ExpressionAttributeNames: {
      "#tag": "tag",
    },
    ExpressionAttributeValues: {
      ":tag": "#LGG99U0",
    },
    ScanIndexForward: "false",
    Limit: 1,
  };
  await documentClient.query(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to read latest item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      throw err;
    } else {
      console.log("GetItem succeeded:");
      warNum = data.Items[0].warNumber;
      
     
    }
  }).promise();
  return warNum;
 
}
