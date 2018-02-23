/* eslint-disable max-len */
angular.module('sendSms')
.component('ocaSendSms', {
  bindings: {
    item: '<',
    finishedSmsEvent: '&',
  },
  template: `
    <div class="send-actions-content-item" layout="row">
      <md-content layout-wrap layout-padding layout-fill>
        <form name="smsForm" novalidate layout="column" layout-align="center center" (submit)="$ctrl.sendSms($event);">
          <div layout="row" class="layout-full-width" layout-align="center center">
            <div flex="20" flex-sm="10" hide-xs></div>
            <div class="form-focus service-form" layout-padding flex>
              <div layout-margin>
                <div layout="column">
                  <h4 class="md-subhead">Standard message and data rates may apply.</h4>
                  <md-input-container class="underlined-input md-required">
                    <label>Phone number:</label>
                    <input ng-model="$ctrl.phoneNumber" name="phoneNumber" type="text" required ng-pattern="::$ctrl.telRegEx">
                    <div ng-messages="smsForm.phoneNumber.$error">
                      <div ng-message="pattern, required ">phone number is invalid</div>
                    </div>
                  </md-input-container>
                  <md-input-container class="md-required">
                    <label>Carrier:</label>
                    <md-select ng-model="$ctrl.carrier" name="carrier" placeholder="Select a carrier" required>
                      <md-option ng-repeat="(carrier, address) in carriers" value="{{ address }}">
                        {{ carrier }}
                      </md-option>
                    </md-select>
                    <div ng-messages="smsForm.carrier.$error">
                      <div ng-message="required">please select a carrier</div>
                    </div>
                  </md-input-container>
                  <md-input-container class="underlined-input" ng-if="$ctrl.isCaptcha">
                    <div vc-recaptcha key="$ctrl.getCaptchaPublicKey()" on-success="$ctrl.setResponse(response)"></div>
                    <span class="recaptcha-error-info" ng-show="smsForm.$submitted && ($ctrl.statusCode != 200 || smsForm.recaptchaResponse.$invalid || smsForm.$error.recaptcha.length)">
                      <span translate="captcha.notselected"></span>
                    </span>
                  </md-input-container>
                  <md-input-container class="underlined-input" ng-show="$ctrl.statusCode != 200">
                    <span class="recaptcha-error-info" ng-show="$ctrl.statusCode != 200">
                      <span>{{$ctrl.statusMessage}}</span>
                    </span>
                  </md-input-container>
                </div>
              </div>
            </div>
            <div flex="20" flex-sm="10" hide-xs></div>
          </div>
          <div layout="row">
            <div layout="row" layout-align="center" layout-fill>
              <md-button type="submit" class="button-with-icon button-large button-confirm" aria-label="Send the result by SMS">
                <prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="send"></prm-icon>
                <span translate="email.popup.link.send"></span>
              </md-button>
            </div>
          </div>
        </form>
      </md-content>
    </div>
    <oca-send-sms-after parent-ctrl="$ctrl"></oca-send-sms-after>`,
  controller: ['$http', '$scope', 'smsCarriers', 'smsCarriersDefault', 'smsOptions', 'smsOptionsDefault', function ($http, $scope, smsCarriers, smsCarriersDefault, smsOptions, smsOptionsDefault) {
    this.$onInit = () => {
      $scope.carriers = angular.equals(smsCarriers, {}) ? smsCarriersDefault : smsCarriers
      this.carrier = this.phoneNumber = this.gCaptchaResponse = this.statusMessage = ''
      this.telRegEx = /^\d{3}( |-)?\d{3}( |-)?\d{4}$/
      this.statusCode = 200
    }
    this.validate = () => this.telRegEx.test(this.phoneNumber) && this.carrier && (this.isCaptcha ? this.gCaptchaResponse : true)
    this.isCaptcha = window.appConfig['system-configuration']['Activate Captcha [Y/N]'] == 'Y'
    this.getCaptchaPublicKey = () => window.appConfig['system-configuration']['Public Captcha Key']
    this.setResponse = (response) => this.gCaptchaResponse = response
    this.setStatusCode = (code) => this.statusCode = code
    this.setStatusMessage = (message) => this.statusMessage = message
    this.sendSms = () => {
    if (this.validate()) {
      let message = 'Title: ' + this.item.pnx.display.title + '<br><br>'
      if(this.item.delivery.holding.length > 0) {
        let holdings = ''
        this.item.delivery.holding.forEach(function (holding) {
          if(holding.organization == appConfig['primo-view']['institution']['institution-code']) {
            if(holdings != '') holdings += '<br><br>'
            holdings += 'Location: ' + holding.subLocation + '<br>'
            holdings += 'Call Number: ' + holding.callNumber + '<br>'
            holdings += 'Currently ' + holding.availabilityStatus
          }
        });
        if(holdings == '') message += 'No Print Locations'
        else message += holdings
      } else message += 'No Print Locations'
      $http.post((smsOptions.form_url || smsOptionsDefault.form_url), {
        "from": smsOptions.from_email || smsOptionsDefault.from_email,
        "to": this.phoneNumber + '@' + this.carrier,
        "subject": smsOptions.subject || smsOptionsDefault.subject,
        "message": message,
        "gCaptchaResponse": this.gCaptchaResponse
      }).then((msg) => {
          this.setStatusCode(msg.status)
          this.setStatusMessage(msg.statusText)
          console.log('sms successfully sent', msg)
        }).catch((err) => {
          this.setStatusCode(err.status)
          this.setStatusMessage(err.statusText)
          this.setResponse('')
          grecaptcha.reset()
          console.error('sms sending failed', err)
        }).finally(() => this.statusCode == 200 ? this.finishedSmsEvent() : '')
      }
    }
  }],
}).run(['$templateCache', 'smsAction', 'smsActionDefault', function ($templateCache, smsAction, smsActionDefault) {
  $templateCache.put('components/search/actions/actionContainer/action-container.html', '<oca-send-sms ng-if="($ctrl.actionName===\'' + (smsAction.name || smsActionDefault.name) + '\')" finished-sms-event="$ctrl.throwCloseTabsEvent()" item="::$ctrl.item"></oca-send-sms>' + $templateCache.get('components/search/actions/actionContainer/action-container.html'));
  $templateCache.put('components/search/actions/action-list.html', $templateCache.get('components/search/actions/action-list.html').replace('</md-nav-item>', '</md-nav-item><sms-action />'));
}])
