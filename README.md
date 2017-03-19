# Swabber
Swabber is couchbase cleaner. It can clean all or some of documents
 using regular expressions.
 
## How to use
```javascript
const swabber = require('swabber')('http://localhost')
swabber.flushAll('myBucket', (err) => {
  if(err)
    console.log(err)
  else
    console.log('all fo documents are removed')
})
```