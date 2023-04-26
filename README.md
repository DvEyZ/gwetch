# gwetch

`gwetch` - `fetch`, but for Gopher.

## Usage

```js
const {gwetch} = require('gwetch');

gwetch('gopher://gopher.floodgap.com').then((res) => {
    res.items().then((items) => {
        items.forEach((i) => {
            console.log(i);
        })
    })
})
```

## Options

- `timeout` - connection timeout, in ms. Default is `5000`.