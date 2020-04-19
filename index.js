const AWS = require("aws-sdk");
const apiCaller = require("./apiHelper.js");
const apiToken = require("./apiToken.js");
AWS.config.update({ region: "us-east-2" });
const documentClient = new AWS.DynamoDB.DocumentClient();
let warNum = undefined;

console.log("Running");
onStartup();
setInterval(checkStatus, 1800000);



async function onStartup() {
  try {
    const endpoint = "https://api.clashroyale.com/v1/clans/%23LGG99U0/warlog";
    const stat = await apiCaller(endpoint, apiToken());
    const response = JSON.parse(stat.responseText);
    if (stat.status !== 200) {
      throw `${stat.status} ${response.reason}`;
    }
    const prevWar = await prevWarStats();
    warNum = prevWar[0].warNumber;
    console.log(warNum);
    response.items.forEach((war) => {
      let needUpdate = true;
      for (let ind = 0; ind < prevWar.length; ind++) {
        console.log(war.createdDate , prevWar[ind].createdDate) ;
        console.log(war.createdDate === prevWar[ind].createdDate);
        if (prevWar[ind].createdDate === war.createdDate&& prevWar[ind].createdDate && war.createdDate) {
          needUpdate = false;
          break;
        }
      }
      if (needUpdate) {
        checkForUpdates(prevWar[0], war);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function checkStatus() {
  const today = new Date();
  const date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;
  console.log("Checking update at", dateTime);
  try {
    const endpoint = "https://api.clashroyale.com/v1/clans/%23LGG99U0/warlog";
    const stat = await apiCaller(endpoint, apiToken());
    const response = JSON.parse(stat.responseText);
    if (stat.status !== 200) {
      throw `${stat.status} ${response.reason}`;
    }
    const prevWar = await prevWarStats();
    warNum = prevWar[0].warNumber;
    checkForUpdates(prevWar[0], response.items[0]);
    // console.log(prevWar[0].createdDate === response.items[0].createdDate);
    // if (prevWar[0].createdDate !== response.items[0].createdDate) {
    //   console.log("Starting to Update");
    //   updateTable(prevWar[0].warNumber, response);
    // } else {
    //   console.log("No need to update");
    // }
  } catch (error) {
    console.log(error);
  }
}

async function updateTable(war) {
  warNum++;

  for (let i of war.participants) {
    const dataObj = formatData(i, warNum);
    writeData(dataObj);
  }
  const clanStats = getClanStats(war.standings);
  const dataObj = formatData(clanStats, warNum);
  dataObj.Item.createdDate = war.createdDate;

  writeData(dataObj);
}

function writeData(params) {
  documentClient.put(params, function (err, data) {
    if (err) {
      warNum--;
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
  da = new Date("" + d[0] + d[1] + "-" + d[2] + "-" + d[3] + "T" + d[4] + ":" + d[5] + ":" + d[6] + ".000z");
  return da.toLocaleDateString("en-US", options);
}

async function prevWarStats() {
  let stats = null;
  const params = {
    TableName: "warStats",
    KeyConditionExpression: "#tag = :tag",
    ExpressionAttributeNames: {
      "#tag": "tag",
    },
    ExpressionAttributeValues: {
      ":tag": "#LGG99U0",
    },
    ScanIndexForward: false,
  };
  // BUG: Seems to retrieve the data twice
  //gets info from db
  //Solution maybe make it into a real promise rather than using .promise()
  await documentClient
    .query(params, function (err, data) {
      if (err) {
        console.error("Unable to read latest item. Error JSON:", JSON.stringify(err, null, 2));
        throw err;
      } else {
        console.log("GetItem succeeded:");
        stats = data.Items;
      }
    })
    .promise(); //.promise is probably the reason for the bug but i dont get why.

  return stats;
}

function checkForUpdates(prevWar, currentWar) {
  console.log(prevWar.createdDate, currentWar.createdDate);
  if (prevWar.createdDate !== currentWar.createdDate && prevWar.createdDate && currentWar.createdDate) {
    //second part checks if they are truthy values
    console.log("Starting to Update");
    updateTable(currentWar);
  } else {
    console.log("No need to update");
  }
}
