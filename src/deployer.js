(function(module) {
    "use strict";

    var s3 = require("s3");

    module.exports = function(args) {

        /* Setup S3 Config */
        var credentials = new s3.AWS.SharedIniFileCredentials({
            profile: args.profile || "default"
        });
        s3.AWS.config.credentials = credentials;
        s3.AWS.config.update({
            region: args.region
        });

        /* Create the S3 Client */
        var client = s3.createClient({
            maxAsyncS3: 20,
            s3RetryCount: 3,
            s3RetryDelay: 1000,
            s3Options: {
                // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
            },
        });

        /* Upload Config */
        var params = {
            localDir: this.config.public_dir,
            deleteRemoved: true,

            s3Params: {
                Bucket: args.bucket,
                Prefix: args.prefix || ""
            }
        };

        /* Create the uploader */
        return new Promise(function(resolve, reject) {
            var uploader = client.uploadDir(params);

            uploader.on("error", function(err) {
                console.error("unable to sync:", err.stack);
                reject(err.message);
            });
            uploader.on("progress", function() {
                console.log("progress", uploader.progressMd5Amount, uploader.progressMd5Total);
            });
            uploader.on("end", function() {
                resolve();
            });
        });
    };

})(module);
