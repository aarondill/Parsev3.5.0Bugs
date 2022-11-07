# Parse.Query.first() error reason and repair

## Relevant code from each version for query.first:

### [Parse JS JDK v3.4.4](https://unpkg.com/parse@3.4.4/dist/parse.js):

```js
{
    key: "first",
    value: function (options
    /*:: ?: FullOptions*/
    )
    /*: Promise<ParseObject | void>*/
    {
      var _this4 = this;

      options = options || {};
      var findOptions = {};

      if (options.hasOwnProperty('useMasterKey')) {
        findOptions.useMasterKey = options.useMasterKey;
      }

      if (options.hasOwnProperty('sessionToken')) {
        findOptions.sessionToken = options.sessionToken;
      }

      if (options.hasOwnProperty('context') && (0, _typeof2.default)(options.context) === 'object') {
        findOptions.context = options.context;
      }

      this._setRequestTask(findOptions);

      var controller = _CoreManager.default.getQueryController();

      var params = this.toJSON();
      params.limit = 1;
      var select = this._select;

      if (this._queriesLocalDatastore) {
        return this._handleOfflineQuery(params).then(function (objects) {
          if (!objects[0]) {
            return undefined;
          }

          return objects[0];
        });
      }

      return (0, _find.default)(controller).call(controller, this.className, params, findOptions).then(function (response) {
        var objects = response.results;

        if (!objects[0]) {
          return undefined;
        }

        if (!objects[0].className) {
          objects[0].className = _this4.className;
        } // Make sure the data object contains keys for all objects that
        // have been requested with a select, so that our cached state
        // updates correctly.


        if (select) {
          handleSelectResult(objects[0], select);
        }

        if (options.json) {
          return objects[0];
        } else {
          return _ParseObject.default.fromJSON(objects[0], !select);
        }
      });
    }
    /**
     *Comment describing eachBatch function here
     */
}
```

### [Parse JS JDK v3.5.0](https://unpkg.com/parse@3.5.0/dist/parse.js):

```js
{
    key: "first",
    value: function (options
    /*:: ?: FullOptions*/
    )
    /*: Promise<ParseObject | void>*/
    {
      options = options || {};
      var findOptions = {};

      if (options.hasOwnProperty('useMasterKey')) {
        findOptions.useMasterKey = options.useMasterKey;
      }

      if (options.hasOwnProperty('sessionToken')) {
        findOptions.sessionToken = options.sessionToken;
      }

      if (options.hasOwnProperty('context') && (0, _typeof2.default)(options.context) === 'object') {
        findOptions.context = options.context;
      }

      this._setRequestTask(findOptions);

      var controller = _CoreManager.default.getQueryController();

      var params = this.toJSON();
      params.limit = 1;
      var select = this._select;

      if (this._queriesLocalDatastore) {
        return this._handleOfflineQuery(params).then(function (objects) {
          if (!objects[0]) {
            return undefined;
          }

          return objects[0];
        });
      }

      return (0, _find.default)(controller).call(controller, this.className, params, findOptions).then(function (response) {
        var objects = response.results;

        if (!objects[0]) {
          return undefined;
        }

        if (!objects[0].className) {
          objects[0].className = this.className;
        } // Make sure the data object contains keys for all objects that
        // have been requested with a select, so that our cached state
        // updates correctly.


        if (select) {
          handleSelectResult(objects[0], select);
        }

        if (options.json) {
          return objects[0];
        } else {
          return _ParseObject.default.fromJSON(objects[0], !select);
        }
      });
    }
    /**
     *Comment describing eachBatch function here
    */
}
```

## Important _changes_

### v3.4.4:

Start of query.first function:

```js
var _this4 = this;
```

within return value:

```js
if (!objects[0].className) {
	objects[0].className = _this4.className;
}
```

### 3.5.0

start of query.first function removes \_this4 variable

return value:

```js
if (!objects[0].className) {
	objects[0].className = this.className;
}
```

## Reason for error:

the return value of the first function is:

```js
return (0, _find.default)(controller).call(controller, this.className, params, findOptions).then(function (response) {...})
```

It is important to note that the function within the then call will be run with _this_ set to the globalThis value, which in node.js is undefined; while _\_this4_ in v3.4.4 is a Parse.Query object.

Due to this variation, while at first it seems to have the same result upon the removal of the \_this4 variable in favor of directly using the this value, due to the use of the variable in a seperate scope, the this value resolves to undefined and this is trying to access _undefined.className_ which (understandably) results in a typeError.

this change was likely made to save memory by the removal of a seemingly unnecessary variable, but due to the global scope of the then function, actually causes an error upon calling.

## Solution:

The readdition of the \_this4 variable to the top of the first function, and the modification of the assignment line to the code seen in v3.4.4 will resolve the error and return the correct ParseObject value.

the corrected code will be (identical to the v3.4.4 code):

```js
{
    key: "first",
    value: function (options
    /*:: ?: FullOptions*/
    )
    /*: Promise<ParseObject | void>*/
    {
      var _this4 = this;

      options = options || {};
      var findOptions = {};

      if (options.hasOwnProperty('useMasterKey')) {
        findOptions.useMasterKey = options.useMasterKey;
      }

      if (options.hasOwnProperty('sessionToken')) {
        findOptions.sessionToken = options.sessionToken;
      }

      if (options.hasOwnProperty('context') && (0, _typeof2.default)(options.context) === 'object') {
        findOptions.context = options.context;
      }

      this._setRequestTask(findOptions);

      var controller = _CoreManager.default.getQueryController();

      var params = this.toJSON();
      params.limit = 1;
      var select = this._select;

      if (this._queriesLocalDatastore) {
        return this._handleOfflineQuery(params).then(function (objects) {
          if (!objects[0]) {
            return undefined;
          }

          return objects[0];
        });
      }

      return (0, _find.default)(controller).call(controller, this.className, params, findOptions).then(function (response) {
        var objects = response.results;

        if (!objects[0]) {
          return undefined;
        }

        if (!objects[0].className) {
          objects[0].className = _this4.className;
        } // Make sure the data object contains keys for all objects that
        // have been requested with a select, so that our cached state
        // updates correctly.


        if (select) {
          handleSelectResult(objects[0], select);
        }

        if (options.json) {
          return objects[0];
        } else {
          return _ParseObject.default.fromJSON(objects[0], !select);
        }
      });
    }
    /**
     *Comment describing eachBatch function here
     */
}
```
