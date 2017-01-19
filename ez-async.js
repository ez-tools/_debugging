
export default function async (generator) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      function getCallback (name) {
        callbacks++
        if (name == null) {
          if (callbacks !== 1) {
            gen.throw('You may either request several named callbacks or one unnamed callback!')
          } else {
            return function cb () {
              callbacks--
              handleResult(gen.next(Array.prototype.slice.call(arguments)))
            }
          }
        } else {
          if (callbackValues[name] != null) {
            gen.throw('You already used that callback namespace! You need to `yield` first!')
          } else {
            return function cb () {
              callbacks--
              callbackValues[name] = Array.prototype.slice.call(arguments)
              if (callbacks === 0) {
                handleResult(gen.next(callbackValues))
                callbackValues = {}
              }
            }
          }
        }
      }
      var callbacks = 0
      var callbackValues = {}
      var gen = generator.apply(this, [getCallback].concat(args))

      function handleResult (result) {
        if (result.done) {
          resolve(result.value)
        } else if (result.value instanceof Promise) {
          if (callbacks > 0) {
            gen.throw('You already requested callbacks. You must first await the callbacks before you can yield a promise!')
          }
          result.value.then(function (val) {
            handleResult(gen.next([null, val]))
          }, function (err) {
            handleResult(gen.next([err || 'Promise was rejected']))
          })
        } else if (callbacks === 0) {
          gen.throw('This object is not yield-able, also you did not request any callbacks!')
        }
      }
      handleResult(gen.next())
    })
  }
}
