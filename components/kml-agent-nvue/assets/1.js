var request = require("request");
var fs = require("fs");
console.log("开始上传");
var options = {
  method: "POST",
  url: "https://www.das-ai.com/open/api/v2/agent/file/upload",
  headers: {
    appKey: "hengnaozYW3SnQJNy5hIzs2pp8w",
    sign: "1743952229320/lqtOJMkCv7HsnaIuOVx++rwk2OmCFdGGz+Gmm4ocrQ=",
  },
  formData: {
    file: {
      value: fs.createReadStream(
        "postman-cloud:///1f012f97-04ff-43d0-aeb4-52971ad85462"
      ),
      options: {
        filename: "postman-cloud:///1f012f97-04ff-43d0-aeb4-52971ad85462",
        contentType: null,
      },
    },
  },
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});
