"use strict"

const request   = require('request')
const couchbase = require('couchbase')

const ViewQuery = couchbase.ViewQuery
const cluster   = new couchbase.Cluster('couchbase://127.0.0.1')

module.exports = (server = "http://localhost") => {
  return {
    flushAll(bucketName, cb)
    {
      let bucket = cluster.openBucket(bucketName)
      const options = {
        method: 'PUT',
        uri: `${server}:8092/${bucketName}/_design/dev_flusher`,
        body: {
          "language": "javascript",
          "views": {
            "get_all": {
              "map": "function(doc) {emit(null, null)}"
            }
          }
        },
        json: true
      }
      request.put(options, function (err, res) {
        if (err) cb(err)
        if (res.statusCode != 201) cb('can not create view on bucket')
        request.get({
          url: `http://127.0.0.1:8092/${bucketName}/_design/dev_flusher/_view/get_all?stale=false&inclusive_end=true&connection_timeout=6000&skip=0&reduce=false`
        }, function (err, httpResponse, body) {
          if (err) cb(err)
          body = JSON.parse(body)
          const results = body.rows
          if (results.length != 0) {
            let j = 1;
            for (let i = 0; i < results.length; i++) {
              bucket.remove(results[i].id, function (err, res) {
                if (err) console.log(err)
                if (j == results.length) {
                  bucket.disconnect()
                  cb(null)
                }
                j++
              })
            }
          }
          else {
            bucket.disconnect()
            cb(null)
          }
        })
      })
    }
  }
}
