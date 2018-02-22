angular.module('sendSms')
.value('smsAction', {})
.value('smsActionDefault', {
	name: 'send_sms',
	label: 'SMS',
	index: 9,
	icon: {
		icon: 'ic_smartphone_24px',
		iconSet: 'hardware',
		type: 'svg'
	}
})
.value('smsCarriers', {})
.value('smsCarriersDefault', {
	'ATT': 'txt.att.net',
	'T-Mobile': 'tmomail.net',
	'Virgin': 'vmobl.com',
	'Sprint': 'messaging.sprintpcs.com',
	'Nextel': 'messaging.nextel.com',
	'Verizon': 'vtext.com',
	'Cricket': 'mms.mycricket.com',
	'Qwest': 'qwestmp.com',
	'Project Fi': 'msg.fi.google.com'
})
.value('smsOptions', {})
.value('smsOptionsDefault', {
	from_email: 'primo@exlibris.co.il',
	subject: 'TxtFromOneSearch',
	form_url: 'http://library.csudh.edu/testingp/email.php'
})
