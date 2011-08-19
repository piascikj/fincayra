function MailManager() {}

MailManager.prototype.init = function(config) {}

MailManager.prototype.globalInit = function() {
	if (!this.globalInitCalled) {
		$hide([$config().mail.templateDir]);
		this.globalInitCalled = true;
	}
}

MailManager.instance;

/*
	Function: $mm
	Returns the current MailManager
*/
function $mm() {
	if (MailManager.instance) {
		MailManager.instance.globalInit();
	}
	return MailManager.instance;
}
