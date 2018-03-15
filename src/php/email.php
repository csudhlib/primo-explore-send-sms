<?php
	/* 
	 * This script sends an email to an SMS gateway with call number data from Primo
	 * It also verifies the Google ReCaptcha upon submission, if enabled
	 */

	use PHPMailer\PHPMailer\PHPMailer;
	use PHPMailer\PHPMailer\Exception;

	//Load composer's autoloader
	require 'vendor/autoload.php';

	$params = json_decode(file_get_contents('php://input'),true);
	$enableCaptcha = false;
	$gCaptchaSecret = ''; //Get from Google ReCaptcha Admin
	
	if($enableCaptcha && isset($params['gCaptchaResponse'])) {
		$gCaptchaResponseVerify = json_decode(file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret=' . $gCaptchaSecret . '&response=' . $params['gCaptchaResponse']), true);
		if($gCaptchaResponseVerify['success'] === true) $proceed = true;
	}
	
	if(!$enableCaptcha || isset($proceed)) {
		$mail = new PHPMailer(true);                              // Passing `true` enables exceptions
		try {
			//Server settings
			//$mail->SMTPDebug = 2;                                 // Enable verbose debug output
			$mail->isSMTP();                                      // Set mailer to use SMTP
			$mail->Host = 'relay.library.edu';  // Specify main and backup SMTP servers
			$mail->SMTPAuth = false;                               // Enable SMTP authentication

			//Recipients
			$mail->setFrom($params['from'], 'Mailer');
			$mail->addAddress($params['to']);               
			$mail->addReplyTo($params['from'], 'Mailer');

			//Content
			$mail->Subject = $params['subject'];
			if(strlen($params['message']) > 148) {
				$mail->isHTML(true);                                  // Set email format to HTML
				$mail->Body = $params['message'];
				$mail->AltBody = str_replace('<br>', "\r\n", $params['message']);
			} else {
				$mail->Body = str_replace('<br>', "\r\n", $params['message']);
			}

			$mail->send();
		} catch (Exception $e) {
			header("HTTP/1.1 500 " . error_message($mail->ErrorInfo));
		}
	} else {
		$headerText = "HTTP/1.1 500 ";
		if(isset($gCaptchaResponseVerify['error-codes']))
			foreach($gCaptchaResponseVerify['error-codes'] as $errorCode)
				$headerText .= error_message($errorCode) . ' ';
		header($headerText);
	}

	function error_message($original) {
		/* PHPMailer and ReCaptcha don't output friendly error messages */
		$error_messages = array(
			/* PHPMailer errors */
			'couldaunti' => 'SMTP Error: Could not authenticate.',
			'couldconne' => 'SMTP Error: Could not connect to SMTP host.',
			'dataaccept' => 'SMTP Error: data not accepted.',
			'messagebod' => 'Message body empty',
			'unknownenc' => 'Unknown encoding: ',
			'couldexecu' => 'Could not execute: ',
			'couldacces' => 'Could not access file: ',
			'couldopenf' => 'File Error: Could not open file: ',
			'folgfromad' => 'The following From address failed: ',
			'couldinsta' => 'Could not instantiate mail function.',
			'invalidadd' => 'Invalid address: ',
			'mailerissu' => ' mailer is not supported.',
			'youmustpro' => 'You must provide at least one recipient email address.',
			'folgrecipi' => 'SMTP Error: The following recipients failed: ',
			'signingerr' => 'Signing Error: ',
			'smtpconnec' => 'SMTP connect() failed.',
			'smtpserver' => 'SMTP server error: ',
			'cansetorre' => 'Cannot set or reset variable: ',
			'extensionm' => 'Extension missing: ',
			
			/* recaptcha errors */
			'missputsec' => 'There was an error processing the captcha. (1)',
			'invaputsec' => 'There was an error processing the captcha. (2)',
			'missputres' => 'There was an error processing the captcha. (3)',
			'invaputres' => 'There was an error processing the captcha. (4)',
			'badrequest' => 'There was an error processing the captcha. (5)'
		);
		$remove = array(" ", ".", ":", "(", ")", "-", "smtperror", "fileerror", "the", "not", "ingin", "lidin", "lowin");
		$new = substr(str_replace($remove, "", strtolower($original)), 0, 10);
		echo $new;
		return array_key_exists($new, $error_messages) ? $error_messages[$new] : $original;
	}
?>