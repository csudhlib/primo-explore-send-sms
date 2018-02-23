'use strict';

angular.module('sendSms', ['ngMaterial', 'primo-explore.components', 'customActions']);

/* eslint-disable max-len */
angular.module('sendSms').component('ocaSendSms', {
  bindings: {
    item: '<',
    finishedSmsEvent: '&'
  },
  template: '\n    <div class="send-actions-content-item" layout="row">\n      <md-content layout-wrap layout-padding layout-fill>\n        <form name="smsForm" novalidate layout="column" layout-align="center center" (submit)="$ctrl.sendSms($event);">\n          <div layout="row" class="layout-full-width" layout-align="center center">\n            <div flex="20" flex-sm="10" hide-xs></div>\n            <div class="form-focus service-form" layout-padding flex>\n              <div layout-margin>\n                <div layout="column">\n                  <h4 class="md-subhead">Standard message and data rates may apply.</h4>\n                  <md-input-container class="underlined-input md-required">\n                    <label>Phone number:</label>\n                    <input ng-model="$ctrl.phoneNumber" name="phoneNumber" type="text" required ng-pattern="::$ctrl.telRegEx">\n                    <div ng-messages="smsForm.phoneNumber.$error">\n                      <div ng-message="pattern, required ">phone number is invalid</div>\n                    </div>\n                  </md-input-container>\n                  <md-input-container class="md-required">\n                    <label>Carrier:</label>\n                    <md-select ng-model="$ctrl.carrier" name="carrier" placeholder="Select a carrier" required>\n                      <md-option ng-repeat="(carrier, address) in carriers" value="{{ address }}">\n                        {{ carrier }}\n                      </md-option>\n                    </md-select>\n                    <div ng-messages="smsForm.carrier.$error">\n                      <div ng-message="required">please select a carrier</div>\n                    </div>\n                  </md-input-container>\n                  <md-input-container class="underlined-input" ng-if="$ctrl.isCaptcha">\n                    <div vc-recaptcha key="$ctrl.getCaptchaPublicKey()" on-success="$ctrl.setResponse(response)"></div>\n                    <span class="recaptcha-error-info" ng-show="smsForm.$submitted && ($ctrl.statusCode != 200 || smsForm.recaptchaResponse.$invalid || smsForm.$error.recaptcha.length)">\n                      <span translate="captcha.notselected"></span>\n                    </span>\n                    <span class="recaptcha-error-info" ng-show="$ctrl.statusCode != 200">\n                      <br><span>{{$ctrl.statusMessage}}</span>\n                    </span>\n                  </md-input-container>\n                </div>\n              </div>\n            </div>\n            <div flex="20" flex-sm="10" hide-xs></div>\n          </div>\n          <div layout="row">\n            <div layout="row" layout-align="center" layout-fill>\n              <md-button type="submit" class="button-with-icon button-large button-confirm" aria-label="Send the result by SMS">\n                <prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="send"></prm-icon>\n                <span translate="email.popup.link.send"></span>\n              </md-button>\n            </div>\n          </div>\n        </form>\n      </md-content>\n    </div>\n    <oca-send-sms-after parent-ctrl="$ctrl"></oca-send-sms-after>',
  controller: ['$http', '$scope', '$state', 'smsCarriers', 'smsCarriersDefault', 'smsOptions', 'smsOptionsDefault', function ($http, $scope, $state, smsCarriers, smsCarriersDefault, smsOptions, smsOptionsDefault) {
    var _this = this;

    this.$onInit = function () {
      $scope.carriers = angular.equals(smsCarriers, {}) ? smsCarriersDefault : smsCarriers;
      _this.carrier = _this.phoneNumber = _this.gCaptchaResponse = _this.statusMessage = '';
      _this.telRegEx = /^\d{3}( |-)?\d{3}( |-)?\d{4}$/;
      _this.statusCode = 200;
    };
    this.validate = function () {
      return _this.telRegEx.test(_this.phoneNumber) && _this.carrier && (_this.isCaptcha ? _this.gCaptchaResponse : true);
    };
    this.isCaptcha = window.appConfig['system-configuration']['Activate Captcha [Y/N]'] == 'Y';
    this.getCaptchaPublicKey = function () {
      return window.appConfig['system-configuration']['Public Captcha Key'];
    };
    this.setResponse = function (response) {
      return _this.gCaptchaResponse = response;
    };
    this.setStatusCode = function (code) {
      return _this.statusCode = code;
    };
    this.setStatusMessage = function (message) {
      return _this.statusMessage = message;
    };
    this.sendSms = function () {
      if (_this.validate()) {
        var message = 'Title: ' + _this.item.pnx.display.title + '<br><br>';
        if (_this.item.delivery.holding.length > 0) {
          var holdings = '';
          _this.item.delivery.holding.forEach(function (holding) {
            if (holding.organization == appConfig['primo-view']['institution']['institution-code']) {
              if (holdings != '') holdings += '<br><br>';
              holdings += 'Location: ' + holding.subLocation + '<br>';
              holdings += 'Call Number: ' + holding.callNumber + '<br>';
              holdings += 'Currently ' + holding.availabilityStatus;
            }
          });
          if (holdings == '') message += 'No Print Locations';
          else message += holdings;
        } else message += 'No Print Locations';
        $http.post(smsOptions.form_url || smsOptionsDefault.form_url, {
          "from": smsOptions.from_email || smsOptionsDefault.from_email,
          "to": _this.phoneNumber + '@' + _this.carrier,
          "subject": smsOptions.subject || smsOptionsDefault.subject,
          "message": message,
          "gCaptchaResponse": _this.gCaptchaResponse
        }).then(function (msg) {
          _this.setStatusCode(msg.status);
          _this.setStatusMessage(msg.statusText);
          console.log('sms successfully sent', msg);
        }).catch(function (err) {
          _this.setStatusCode(err.status);
          _this.setStatusMessage(err.statusText);
          _this.setResponse('');
          if(typeof grecaptcha !== 'undefined') grecaptcha.reset();
          console.error('sms sending failed', err);
        }).finally(function () {
          return _this.statusCode == 200 ? _this.finishedSmsEvent() : '';
        });
      }
    };
  }]
}).run(['$templateCache', 'smsAction', 'smsActionDefault', function ($templateCache, smsAction, smsActionDefault) {
  $templateCache.put('components/search/actions/actionContainer/action-container.html', '<oca-send-sms ng-if="($ctrl.actionName===\'' + (smsAction.name || smsActionDefault.name) + '\')" finished-sms-event="$ctrl.throwCloseTabsEvent()" item="::$ctrl.item"></oca-send-sms>' + $templateCache.get('components/search/actions/actionContainer/action-container.html'));
  $templateCache.put('components/search/actions/action-list.html', $templateCache.get('components/search/actions/action-list.html').replace('</md-nav-item>', '</md-nav-item><sms-action />'));
}]);

/* eslint-disable max-len */
angular.module('sendSms').component('smsAction', {
  require: {
    prmActionCtrl: '^prmActionList'
  },
  controller: ['customActions', 'smsAction', 'smsActionDefault', function (customActions, smsAction, smsActionDefault) {
    var _this2 = this;

    smsAction.name = smsAction.name || smsActionDefault.name;
    smsAction.label = smsAction.label || smsActionDefault.label;
    smsAction.index = smsAction.index === 0 ? smsAction.index : smsActionDefault.index;
    smsAction.icon = smsAction.icon || smsActionDefault.icon;
    this.$onInit = function () {
      return customActions.addAction(smsAction, _this2.prmActionCtrl);
    };
    this.$onDestroy = function () {
      return customActions.removeAction(smsAction, _this2.prmActionCtrl);
    };
  }]
});

angular.module('sendSms').value('smsAction', {}).value('smsActionDefault', {
  name: 'send_sms',
  label: 'SMS',
  index: 9,
  icon: {
    icon: 'ic_smartphone_24px',
    iconSet: 'hardware',
    type: 'svg'
  }
}).value('smsCarriers', {}).value('smsCarriersDefault', {
  'ATT': 'txt.att.net',
  'T-Mobile': 'tmomail.net',
  'Virgin': 'vmobl.com',
  'Sprint': 'messaging.sprintpcs.com',
  'Nextel': 'messaging.nextel.com',
  'Verizon': 'vtext.com',
  'Cricket': 'mms.mycricket.com',
  'Qwest': 'qwestmp.com',
  'Project Fi': 'msg.fi.google.com'
}).value('smsOptions', {}).value('smsOptionsDefault', {
  from_email: 'primo@exlibris.co.il',
  subject: 'TxtFromOneSearch',
  form_url: 'http://library.csudh.edu/testingp/email.php'
});