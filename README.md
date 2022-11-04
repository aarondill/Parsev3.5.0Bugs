# parse Errors

## ENV.js file required:

```js
export default ["applicationID", "Javascript Key", "Live query URL"];
```

Inlude valid values to a Back4App application.

Once run with valid values, HTML will update with erorr message given by query.first()
query.subscribe() doesn't return and can't be caught, so the error message returned is a string hard coded
