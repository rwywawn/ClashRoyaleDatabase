const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function callApi(endpoint, apiKey) {
  const request = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    request.open("GET", endpoint, true);
    request.setRequestHeader("authorization", "Bearer " + apiKey);
    request.setRequestHeader("Content-Type", `application/json`);
    request.onload = function() {
      if (this.status === 200) {
        resolve({ responseText: this.responseText, status: this.status });
      } else {
        reject({ status: this.status, responseText: this.responseText });
      }
    };
    request.send();
  });
}

module.exports = async function apiCaller(point, apiToken) {
  return await callApi(point, apiToken)
    .then(function(data) {
      return data;
    })
    .catch(function(error) {
      return error;
    });
};
