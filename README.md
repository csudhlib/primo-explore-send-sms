# primo-explore-send-sms

[![npm version](https://img.shields.io/npm/v/primo-explore-send-sms.svg)](https://www.npmjs.com/package/primo-explore-send-sms)

## Features
Adds an "SMS" action to the actions menu that opens a form for the user to send themselves a text message with item details. Uses a self-hosted php page to send item details to carrier SMS gateways to convert them to text messages. There is a sample page at `src/php/email.php`

### Screenshot
![screenshot](screenshot.png)

## Install
1. Make sure you've installed and configured [primo-explore-devenv](https://github.com/ExLibrisGroup/primo-explore-devenv).
2. Navigate to your template/central package root directory. For example:
    ```
    cd primo-explore/custom/MY_VIEW_ID
    ```
3. If you do not already have a `package.json` file in this directory, create one:
    ```
    npm init -y
    ```
4. Install this package:
    ```
    npm install primo-explore-send-sms --save
    ```

alternatively, just copy `dist/module.js` into your package's `custom.js` file.

**n.b.** This customization depends on [primo-explore-custom-actions](https://github.com/alliance-pcsg/primo-explore-custom-actions). If you didn't install using `npm`, you'll need to also manually install the custom actions package.

## Usage
Once this package is installed, add `sendSms` as a dependency for your custom module definition.

```js
var app = angular.module('viewCustom', ['sendSms'])
```
Note: If you're using the `--browserify` build option, you will need to first import the module with:

```javascript
import 'primo-explore-send-sms';
```
Activate the customization by setting `smsOptions.enabled` to `true`
```js
app.value('smsOptions', {
  enabled: true
})
```

#### Configuration

There are three options objects which can be defined to configure the functionality and look of the action as well as the available SMS carriers  
Default options are provided in a 'Default' variant of the option object, as shown below. _Only override the non-default object_

##### smsOptions / smsOptionsDefault
governs the default miscellaneous configuration options

| name                | type           | usage                                                                                  |
|---------------------|----------------|----------------------------------------------------------------------------------------|
| `enabled`           | boolean        | enables the send-sms action                                                            |
| `formUrl`           | string (url)   | url to external form processor (see `src/php/email.php` for example)                   |
| `fromEmail`         | string (email) | email which the SMS message will display as sent from, also the reply to email         |
| `subject`           | string         | subject of the SMS, can only be up to 16 characters for non-HTML recipients            |
| `noPrintFoundLabel` | string         | text which will be sent if there are no physical resources for the requested record    |

##### smsAction / smsActionDefault
governs the look of the action icon  
_<small>see [primo-explore-custom-actions](https://github.com/alliance-pcsg/primo-explore-custom-actions) for more info on how to customize it</small>_

| name                | type           | usage                                                                                  |
|---------------------|----------------|----------------------------------------------------------------------------------------|
| `name`              | string         | name of the action, should not need to change                                          |
| `label`             | string         | text to use below the action icon                                                      |
| `index`             | int            | position in the action list to place the sms action                                    |
| `icon`              | object         | contains the icon definitions; if defined, all icon object properties must be defined  |
| `icon.icon`         | string         | name of the icon to use                                                                |
| `icon.iconSet`      | string         | name of the icon set the icon belongs to                                               |
| `icon.type`         | string         | format of the icon to use                                                              |

##### smsCarriers / smsCarriersDefault
governs the available SMS carriers  
_<small>contains a map of carrier options to their respective [SMS gateway](https://en.wikipedia.org/wiki/SMS_gateway) addresses</small>_

| name                | type           | usage                                                                                  |
|---------------------|----------------|----------------------------------------------------------------------------------------|
| `carrier name`      | string         | the SMS gateway for the defined carrier                                                |
|                     |                |                                                                                        |
| _Examples_          |                |                                                                                        |
| `ATT`               | string         | `txt.att.net`                                                                          |
| `T-Mobile`          | string         | `tmomail.net`                                                                          |
| `Virgin Mobile`     | string         | `vmobl.com`                                                                            |

You can see the default options for all three properties by looking at `src/js/smsOptions.value.js` in this repository.

### Example

```js
var app = angular.module('viewCustom', ['customActions, sendSms'])

// changes the action label to 'Text Me' and moves the action to the left side of the list
app.value('smsAction', {
  label: 'Text Me',
  index: 0,
})

// shortens the list of available SMS carriers
app.value('smsCarriers', {
  'ATT': 'txt.att.net',
  'T-Mobile': 'tmomail.net',
  'Project Fi': 'msg.fi.google.com'
})

// activates the customizations, points to the external form processor,
// sets the SMS subject to 'TxtFromOneSearch' and sender email to 'sms@my.library.edu',
// sets the label for no physical items found to 'No Print Locations'
app.value('smsOptions', {
  enabled: true,
  formUrl: 'https://my.library.edu/email.php',
  fromEmail: 'sms@my.library.edu',
  subject: 'TxtFromOneSearch',
  noPrintFoundLabel: 'No Print Locations'
})

```

<!-- ## Running tests
1. Clone the repo
2. Run `npm install`
3. Run `npm test` -->
