<?php
	use PHPMailer\PHPMailer\PHPMailer;
	use PHPMailer\PHPMailer\Exception;

	//Load composer's autoloader
	require 'vendor/autoload.php';

	$params = json_decode(file_get_contents('php://input'),true);
	if(isset($params['gCaptchaResponse'])) {
		//Get from Google ReCaptcha Admin
		$gCaptchaSecret = '';
		$gCaptchaResponseVerify = json_decode(file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret=' . $gCaptchaSecret . '&response=' . $params['gCaptchaResponse']), true);
		if($gCaptchaResponseVerify['success'] === true) {
			$mail = new PHPMailer(true);                              // Passing `true` enables exceptions
			try {
				//Server settings
				//$mail->SMTPDebug = 2;                                 // Enable verbose debug output
				$mail->isSMTP();                                      // Set mailer to use SMTP
				$mail->Host = 'relay.library.edu';  // Specify main and backup SMTP servers
				$mail->SMTPAuth = false;                               // Enable SMTP authentication

				//Recipients
				$mail->setFrom($params['from'], 'Mailer');
				$mail->addAddress($params['to']);               // Name is optional
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
				header("HTTP/1.1 500 " . $mail->ErrorInfo);
			}
		} else {
			$headerText = "HTTP/1.1 500 ";
			if(isset($gCaptchaResponseVerify['error-codes']))
				foreach($gCaptchaResponseVerify['error-codes'] as $errorCode)
					$headerText .= $errorCode . ' ';
			header($headerText);
		}
	}
?>