_ = require "underscore"

flowifySync = (self, task, input, output) ->
  (callback) ->
    memo = if input then self.memo[input] else self.memo
    try
      result = task memo
    catch e
      error = e
    if error
      callback(error)
    else
      if not result
        callback("Sync Function returned false")
      else
        if output
          self.memo[output] = result
        callback()

flowifyAsync = (self, task, input, output) ->
  (callback) ->
    memo = if input then self.memo[input] else self.memo
    task memo, (err, result) ->
      if err then return callback(err)
      if output then self.memo[output] = result
      callback()

class Flow

  constructor: ->
    @error = null
    @tasks = []

  sync: (task, input, output) ->
    @tasks.push flowifySync(this, task, input, output)
    this

  async: (task, input, output) ->
    @tasks.push flowifyAsync(this, task, input, output)
    this

  step: (@error) =>
    if (@index is @tasks.length) or @error
      @notify()
    else
      @tasks[@index]?(@step)
      @index += 1

  notify: ->
    @cb(@error, @memo)

  run: (@memo, @cb) ->
    @index = 0
    @memo.input = _.clone(@memo)
    @step()
    this

  runMany: (@items, @final) ->
    @nextMany()

  ignoreErrors: true
  nextMany: (err) =>
    if @items.length and (not err or @ignoreErrors)
      @run @items.shift(), @nextMany
    else
      @final()


module.exports =  -> new Flow