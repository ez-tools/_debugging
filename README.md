# ez-async
> Yet another async library using generators

This library aims to be compatible to promises and node style callbacks.

Note: Node style callbacks accept two parameters `function cb (error, result) {..}`. 

##### Handle Promises

```
var f = async(function * (getCallback, arg1, arg2 /*, arg3, ..*/) {
  // `getCallback` is used to handle node style callbacks. It is inserted in the `arguments` list as the first parameter
  var [err, res] = yield Promise.resolve("Success") // => [null, "Success"]
  var [err, res] = yield Promise.reject("Fail") // => ["Fail", null]
  var [err, [p1, p2]] = yield Promise.all([Promise.resolve('p1'), Promise.resolve('p2')])
  return 'success'
})

// f(..) returns a promise
f(arg1, arg2).then(..)
```

##### Handle node style callbacks

```
var fs = require('fs')
var async = require('ez-async')

/* 
  getFile(path : string) : Promise
  
  A function that accepts _one_ argument `path` and returns a Promise.
*/
var getFile = async(function * (getCallback, path) {
  // `getCallback` creates callbacks for node style async functions
  // if `getCallback` was called, the next yield returns its result (the yielded value is ignored)

  var [err, content] = yield fs.readFile(path, 'utf8', getCallback())
  if (err != null) {
    throw new Error('File is not available!')
  } else {
    return content
  }
})

// Now we can call `getFile(path)` and do the usual promise stuff
getFile('package.json')
  .then(function (content) {
    console.log(content) // logs file content if file exists  
  })
  .catch(function (err) {
    console.err(err) // logs 'File is not available!' if an error occurs
  })
```

##### Asynchronous magic for node style callbacks
You can also create named callbacks. The next yield will wait for all callbacks to be called
```
var getFiles = async(function * (getCallback, path1, path2) {
  fs.readFile(path, 'utf8', getCallback('path1'))
  fs.readFile(path, 'utf8', getCallback('path1'))
  // wait for both callbacks to be called:
  var { path1, path2 } = yield
  return [path1, path2]
})
```

## License
ez-build-lib is licensed under the [MIT License](./LICENSE).