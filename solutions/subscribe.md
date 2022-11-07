# Parse.Query.subscribe() Error Reason and Solution

**Quick warning**, this comment is nearly identical to the comment above. To save reading, the v3.5.0 update removed a _\_this2_ variable that captures the _this_ context at the beginning of the subscribe function, which is then referenced within a then statement, whose this value is equal to undefined due to running in [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#no_this_substitution).

## Relevant code from each version for query.first:

### [Parse JS JDK v3.4.4](https://unpkg.com/parse@3.4.4/dist/parse.js):

```js
{
    key: "subscribe",
    value: function (query
    /*: Object*/
    , sessionToken
    /*: ?string*/
    )
    /*: LiveQuerySubscription*/
    {
      var _this2 = this;

      if (!query) {
        return;
      }

      var className = query.className;
      var queryJSON = query.toJSON();
      var where = queryJSON.where;
      var fields = (0, _keys.default)(queryJSON) ? (0, _keys.default)(queryJSON).split(',') : undefined;
      var subscribeRequest = {
        op: OP_TYPES.SUBSCRIBE,
        requestId: this.requestId,
        query: {
          className: className,
          where: where,
          fields: fields
        }
      };

      if (sessionToken) {
        subscribeRequest.sessionToken = sessionToken;
      }

      var subscription = new _LiveQuerySubscription.default(this.requestId, query, sessionToken);
      this.subscriptions.set(this.requestId, subscription);
      this.requestId += 1;
      this.connectPromise.then(function () {
        _this2.socket.send((0, _stringify.default)(subscribeRequest));
      });
      return subscription;
    }
    /**
     * After calling unsubscribe you'll stop receiving events from the subscription object.
     *
     * @param {object} subscription - subscription you would like to unsubscribe from.
     */

  }
```

### [Parse JS JDK v3.5.0](https://unpkg.com/parse@3.5.0/dist/parse.js):

```js
{
    key: "subscribe",
    value: function (query
    /*: Object*/
    , sessionToken
    /*: ?string*/
    )
    /*: LiveQuerySubscription*/
    {
      if (!query) {
        return;
      }

      var className = query.className;
      var queryJSON = query.toJSON();
      var where = queryJSON.where;
      var fields = (0, _keys.default)(queryJSON) ? (0, _keys.default)(queryJSON).split(',') : undefined;
      var subscribeRequest = {
        op: OP_TYPES.SUBSCRIBE,
        requestId: this.requestId,
        query: {
          className: className,
          where: where,
          fields: fields
        }
      };

      if (sessionToken) {
        subscribeRequest.sessionToken = sessionToken;
      }

      var subscription = new _LiveQuerySubscription.default(this.requestId, query, sessionToken);
      this.subscriptions.set(this.requestId, subscription);
      this.requestId += 1;
      this.connectPromise.then(function () {
        this.socket.send((0, _stringify.default)(subscribeRequest));
      });
      return subscription;
    }
    /**
     * After calling unsubscribe you'll stop receiving events from the subscription object.
     *
     * @param {object} subscription - subscription you would like to unsubscribe from.
     */

  },{
    key: "subscribe",
    value: function (query
    /*: Object*/
    , sessionToken
    /*: ?string*/
    )
    /*: LiveQuerySubscription*/
    {
      if (!query) {
        return;
      }

      var className = query.className;
      var queryJSON = query.toJSON();
      var where = queryJSON.where;
      var fields = (0, _keys.default)(queryJSON) ? (0, _keys.default)(queryJSON).split(',') : undefined;
      var subscribeRequest = {
        op: OP_TYPES.SUBSCRIBE,
        requestId: this.requestId,
        query: {
          className: className,
          where: where,
          fields: fields
        }
      };

      if (sessionToken) {
        subscribeRequest.sessionToken = sessionToken;
      }

      var subscription = new _LiveQuerySubscription.default(this.requestId, query, sessionToken);
      this.subscriptions.set(this.requestId, subscription);
      this.requestId += 1;
      this.connectPromise.then(function () {
        this.socket.send((0, _stringify.default)(subscribeRequest));
      });
      return subscription;
    }
    /**
     * After calling unsubscribe you'll stop receiving events from the subscription object.
     *
     * @param {object} subscription - subscription you would like to unsubscribe from.
     */
  }
```

## Important _changes_

### v3.4.4:

Start of query.subscribe function:

```js
var _this2 = this;
```

just before return(error thrown in v4.5.0)

```js
this.connectPromise.then(function () {
	_this2.socket.send((0, _stringify.default)(subscribeRequest));
});
```

### v3.5.0

start of Query.subscribe function removes \_this2 variable

just before return(error thrown in v4.5.0):

```js
this.connectPromise.then(function () {
	this.socket.send((0, _stringify.default)(subscribeRequest));
});
```

## Reason for error:

the v3.5.0 code uses this line:

```js
this.connectPromise.then(function () {
	this.socket.send((0, _stringify.default)(subscribeRequest));
});
```

Similarly to the Parse.Query.first() issue, it is important to note that the function within the then call will be run with _this_ set to undefined due to [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#no_this_substitution); while _\_this2_ in v3.4.4 is a Parse.Query object.

Due to this variation, while at first it seems to have the same result upon the removal of the \_this2 variable in favor of directly using the this value, due to the use of the variable in a seperate scope, the this value resolves to undefined and this is trying to access _undefined.socket_ which (understandably) results in a typeError.

this change was likely made to save memory by the removal of a seemingly unnecessary variable, but due to the global scope of the then function, actually causes an error upon calling.

## Solution:

The readdition of the \_this2 variable to the top of the subscribe function, and the modification of the code to the code seen in v3.4.4 will resolve the error and return the correct LiveQuerySubscription value.

the corrected code will be (identical to the v3.4.4 code):

```js
{
    key: "subscribe",
    value: function (query
    /*: Object*/
    , sessionToken
    /*: ?string*/
    )
    /*: LiveQuerySubscription*/
    {
      var _this2 = this;

      if (!query) {
        return;
      }

      var className = query.className;
      var queryJSON = query.toJSON();
      var where = queryJSON.where;
      var fields = (0, _keys.default)(queryJSON) ? (0, _keys.default)(queryJSON).split(',') : undefined;
      var subscribeRequest = {
        op: OP_TYPES.SUBSCRIBE,
        requestId: this.requestId,
        query: {
          className: className,
          where: where,
          fields: fields
        }
      };

      if (sessionToken) {
        subscribeRequest.sessionToken = sessionToken;
      }

      var subscription = new _LiveQuerySubscription.default(this.requestId, query, sessionToken);
      this.subscriptions.set(this.requestId, subscription);
      this.requestId += 1;
      this.connectPromise.then(function () {
        _this2.socket.send((0, _stringify.default)(subscribeRequest));
      });
      return subscription;
    }
    /**
     * After calling unsubscribe you'll stop receiving events from the subscription object.
     *
     * @param {object} subscription - subscription you would like to unsubscribe from.
     */

  }
```
