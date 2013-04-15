### Flow Control with Chainanble API & Shared State

Docs coming soon. Here is an example:

```coffeescript
flow = require "flowchain"

processImage = flow()
  .sync(getLocation, null, "location")
  .async(fs.stat, "location", "stat")
  .sync(isFile)
  .async(getDims, "location", "dims")
  .async(save)

processImage.runMany photos, ->
  console.log "Completed"
```

### Sync
`sync = (task, input, output)`
The sync method adds a synchronous task to the object.

If `input` is defined, then it is used as a key to the memo object to get the data to pass into the task.

If `output` is defined, then it is used as a key on the memo object to store the output of the function

### Async
`async` works in the same way, but accepts asynchronous functions.

If `output` is defined then the 2nd argument passed to the callback function will be saved.