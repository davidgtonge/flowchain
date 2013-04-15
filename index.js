// Generated by CoffeeScript 1.6.2
(function() {
  var Flow, flowifyAsync, flowifySync, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require("underscore");

  flowifySync = function(self, task, input, output) {
    return function(callback) {
      var e, error, memo, result;

      memo = input ? self.memo[input] : self.memo;
      try {
        result = task(memo);
      } catch (_error) {
        e = _error;
        error = e;
      }
      if (error) {
        return callback(error);
      } else {
        if (!result) {
          return callback("Sync Function returned false");
        } else {
          if (output) {
            self.memo[output] = result;
          }
          return callback();
        }
      }
    };
  };

  flowifyAsync = function(self, task, input, output) {
    return function(callback) {
      var memo;

      memo = input ? self.memo[input] : self.memo;
      return task(memo, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (output) {
          self.memo[output] = result;
        }
        return callback();
      });
    };
  };

  Flow = (function() {
    function Flow() {
      this.nextMany = __bind(this.nextMany, this);
      this.step = __bind(this.step, this);      this.error = null;
      this.tasks = [];
    }

    Flow.prototype.sync = function(task, input, output) {
      this.tasks.push(flowifySync(this, task, input, output));
      return this;
    };

    Flow.prototype.async = function(task, input, output) {
      this.tasks.push(flowifyAsync(this, task, input, output));
      return this;
    };

    Flow.prototype.step = function(error) {
      var _base, _name;

      this.error = error;
      if ((this.index === this.tasks.length) || this.error) {
        return this.notify();
      } else {
        if (typeof (_base = this.tasks)[_name = this.index] === "function") {
          _base[_name](this.step);
        }
        return this.index += 1;
      }
    };

    Flow.prototype.notify = function() {
      return this.cb(this.error, this.memo);
    };

    Flow.prototype.run = function(memo, cb) {
      this.memo = memo;
      this.cb = cb;
      this.index = 0;
      this.memo.input = _.clone(this.memo);
      this.step();
      return this;
    };

    Flow.prototype.runMany = function(items, final) {
      this.items = items;
      this.final = final;
      return this.nextMany();
    };

    Flow.prototype.ignoreErrors = true;

    Flow.prototype.nextMany = function(err) {
      if (this.items.length && (!err || this.ignoreErrors)) {
        return this.run(this.items.shift(), this.nextMany);
      } else {
        return this.final();
      }
    };

    return Flow;

  })();

  module.exports = function() {
    return new Flow;
  };

}).call(this);
