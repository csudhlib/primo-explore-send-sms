/* eslint-disable max-len */
angular.module('sendSms')
.component('smsAction', {
  require: {
    prmActionCtrl: '^prmActionList',
  },
  controller: ['customActions', 'smsAction', 'smsActionDefault',
  function (customActions, smsAction, smsActionDefault) {
    smsAction.name = smsAction.name || smsActionDefault.name;
    smsAction.label = smsAction.label || smsActionDefault.label;
    smsAction.index = smsAction.index === 0 ? smsAction.index : smsActionDefault.index;
    smsAction.icon = smsAction.icon || smsActionDefault.icon;
    this.$onInit = () => customActions.addAction(smsAction, this.prmActionCtrl)
    this.$onDestroy = () => customActions.removeAction(smsAction, this.prmActionCtrl)
  }],
})
