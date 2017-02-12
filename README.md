# ssi-loader

Webpack SSI loader

This is a very simple implementation of SSI to be used with as a webpack loader
in development mode.

Currently only the **block** and **include** directives are supported:


```
<!--# block name="shush" --><!--# endblock -->
```

```
<!--# include virtual="/includes/new/pre/async" stub="shush" -->
```


Inside your **webpack.dev.config.js** file just add the reference to ssi-loader:

```js
// webpack.dev.config.js

module: {
      rules: [
      {
        test: /\.html?$/,
        use: [
          {
            loader: 'html-loader' // Used to output as html
          },
          {
            loader: 'ssi-loader',
            options: {
              locations: {
                "^/includes": "https://www.uswitch.com",
                "^/widgets": "https://www.uswitch.com"
              }
            }
          }
        ]
      }
```

This will replace all SSI directives with the actual include content.
The ssi-loader only handles the server side includes, in order to return
a valid webpack source you can use the **html-loader** like shown in the
previous example.
