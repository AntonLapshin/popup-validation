# popup-validation
Pure JavaScript/CSS library for validating DOM input fields

[![Gemnasium](https://img.shields.io/gemnasium/mathiasbynens/he.svg)]()
![Lib Size](http://img.badgesize.io/AntonLapshin/popup-validation/master/bin/validation.min.js.svg?compression=gzip)
[![npm](https://img.shields.io/npm/dt/popup-validation.svg)](https://www.npmjs.com/package/popup-validation)
[![GitHub stars](https://img.shields.io/github/stars/AntonLapshin/popup-validation.svg?style=social&label=Star)](https://github.com/AntonLapshin/popup-validation)

[Demo](https://antonlapshin.github.io/popup-validation/)

[JSFiddle](https://jsfiddle.net/AntonLapshin/hjwg8a89/)

![](https://cdn.pbrd.co/images/GEzQ5ob.png)

## Install

    npm install popup-validation --save

Read [API](#API)

## Usage

HTML

```html
<link href="validation.css" rel="stylesheet">
<script src="validation.min.js"></script> 

<div>
  <label for="email">Email:</label>
  <input type="email" id="email" class="validate" 
         data-validate="required,email" />
</div>  
```

JS

Initialization

* Track input fields inside of the `<body>`

```js
validation.init();
```

* Track input fields inside of a container or a form. `Submit` event will be prevented if there are any errors

```js
validation.init("#myForm");
```

* Set options: trigger events (when popups should be shown)

```js
validation.init("#myForm", {
  events: ["change", "paste", "keyup"]
});
```

Usage

```js
// Show errors
validation.highlight();

// Hide errors
validation.hide();

// Check if container is valid (body by default)
validation.isValid();

// Check if cotnainer is valid (body by default) + highlight
validation.validate();
```

## Custom Class Validation

Some services like [Braintree](https://www.braintreepayments.com/) use iframes to control the inputs on a page. That also can be useful if some javascript logic sets and removes a certain class to/from a div or input field that indicates that the field is not validated.

HTML

```html
<div id="customClassValidation" class="validate-class">
  Click at me to toggle custom class validation
</div> 
```

JS

```js
validation.addClassValidation(".my-class-invalid");

// Test
document.getElementById("customClassValidation").addEventListener("click", e => {
  e.target.classList.toggle(".my-class-invalid");
});
```

## Predefined Rules

* required
* email

> The set of rules can be easily extended. Please take a look at the [example](#RULES)

<a name="API"></a>

# API

## validation.init(el, options) => <code>self</code>
Initialize the validation fields inside of the `el` container. If `el` is a `<form>` element then submit event will be prevented if there are any errors

**Returns**: <code>object</code> - Self validation instance for chain calls

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | Container or `<form>` Element |
| options | <code>Object</code> | [Optional] Set of the properties |

Default Options

```js
{
  events: ["change", "paste", "blur", "keyup"]
}
```

Affects all input fields with `validate` class

`data-validate` attr can contain the list of the rules

Example: 

```html
<input class="validate" data-validate="required" />
<input type="email" class="validate" data-validate="required,email" />
```

## validation.destroy(el) => <code>self</code>
Deactivate the validation fields inside of the `el` container

**Returns**: <code>object</code> - Self validation instance for chain calls

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | Container or `<form>` Element |

## validation.hide(el) => <code>self</code>
Hide all errors inside of the `el` container

**Returns**: <code>object</code> - Self validation instance for chain calls

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | Container or `<form>` Element |

## validation.highlight(el) => <code>self</code>
Highlight all errors inside of the `el` container

**Returns**: <code>object</code> - Self validation instance for chain calls

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | Container or `<form>` Element |

## validation.isValid(el) => <code>boolean</code>
Check if all input fields inside of the `el` container are valid

**Returns**: <code>boolean</code> - True if all input fields inside of the container are valid

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | Container or `<form>` Element |

## validation.validate(el) => <code>boolean</code>
Validate all input fields inside of the `el` container 

**Returns**: <code>boolean</code> - True if all input fields inside of the container are valid

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | Container or `<form>` Element |

## validation.rules <code>object</code>
The set of the predefined rules

### Rule signature
el => <code>boolean</code>

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | input field |

**Returns**: <code>boolean</code> - True if the field is validated

<a name="RULES"></a>

## Example of extending rules

JS

```js
validation.rules["integer"] = {
  message: "Value is not an integer",
  method: el => {
    return el.value.length === 0 || !isNaN(parseInt(el.value, 10));
  }    
}
```

HTML

```html
<input class="validate" data-validate="required,integer" />
```

## validation.addClassValidation(selector) => <code>self</code>
Add class validation. For external libraries that can set/remove className of the element. For instance, braintree-hosted-fields-invalid class is set by braintree client library when iframe with the input field detects an error, More info here:
https://developers.braintreepayments.com/guides/hosted-fields/styling/javascript/v2

**Returns**: <code>object</code> - Self validation instance for chain calls

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | Selector that indicates that the field is invalid |

---

## Browsers support <sub>made by <a href="https://godban.github.io">godban</a></sub>

| [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/edge.png" alt="IE / Edge" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/firefox.png" alt="Firefox" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome.png" alt="Chrome" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari.png" alt="Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/opera.png" alt="Opera" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Opera | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari-ios.png" alt="iOS Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>iOS Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome-android.png" alt="Chrome for Android" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome for Android |
| --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| IE9+ | last 12 versions | last 10 versions| last 15 versions | last 14 versions| last 12 versions | last 13 versions

## License

MIT