function MailManager() {}

MailManager.prototype.init = function(config) {}

MailManager.instance;

/*
	Function: $mm
	Returns the current MailManager
*/
function $mm() {
	return MailManager.instance;
}
