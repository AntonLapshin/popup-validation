# popup-validate
Pure JavaScript/CSS library for validating DOM input fields

[![Gemnasium](https://img.shields.io/gemnasium/mathiasbynens/he.svg)]()
![Lib Size](http://img.badgesize.io/AntonLapshin/popup-validation/master/bin/popup-validation.min.js.svg?compression=gzip)
[![npm](https://img.shields.io/npm/dt/popup-validation.svg)](https://www.npmjs.com/package/popup-validation)
[![GitHub stars](https://img.shields.io/github/stars/AntonLapshin/popup-validation.svg?style=social&label=Star)](https://github.com/AntonLapshin/popup-validation)

[Demo](https://antonlapshin.github.io/popup-validation/)

[JSFiddle](https://jsfiddle.net/AntonLapshin/hjwg8a89/)

![](https://snag.gy/KCPZ52.jpg)

## Install

    npm install popup-validation --save

Read [API](#API)

## Usage

HTML

```html
  <link href="validation.css" rel="stylesheet">
  <script src="validation.es6.js"></script>
  <!-- Or minified ES5 version -->
  <!-- <script src="validation.min.js"></script> -->

  <div>
    <label for="email">Email:</label>
    <input type="email" id="email" class="validate form-control" data-validate="required, email" />
  </div>  
```

JavaScript

```js
validation.init();
```

<a name="API"></a>

# API

## validation.init() => <code>void</code>
Initialize the validation fields

Affects all input fields with `validate` class

`data-validate` attr can contain the list of the rules

Example: 

```html
<input class="validate" data-validate="required" />
<input type="email" class="validate" data-validate="required, email" />
```

## validation.destroy() => <code>void</code>
Deactivate the validation fields

## validation.getRules() => <code>object</code>
Get the set of predefined rules

**Returns**: <code>object</code> - The list of predefined rules

### Rule signature
el => <code>boolean</code>

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | input field |

**Returns**: <code>boolean</code> - True if the field is validated

## Example of extending Rules

```js
  const Rules = validation.getRules();
  Rules["integer"] = {
    message: "Value is not an integer",
    method: el => {
      return parseInt(el.value, 10) !== NaN;
    }    
  }
```

```html
<input class="validate" data-validate="required, integer" />
```

---

## Browsers support <sub><sup>made by <a href="https://godban.github.io">godban</a></sup></sub>

| [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/edge.png" alt="IE / Edge" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/firefox.png" alt="Firefox" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome.png" alt="Chrome" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari.png" alt="Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/opera.png" alt="Opera" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Opera | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari-ios.png" alt="iOS Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>iOS Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome-android.png" alt="Chrome for Android" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome for Android |
| --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| IE9+ | last 12 versions | last 10 versions| last 15 versions | last 14 versions| last 12 versions | last 13 versions

## License

MIT