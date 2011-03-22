package org.innobuilt.fincayra.mail;

import org.innobuilt.fincayra.FincayraApplication;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.StatefulJob;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MailJob implements StatefulJob {
	private final Logger LOGGER = LoggerFactory.getLogger(MailJob.class);
	public void execute(JobExecutionContext ctx) throws JobExecutionException {
		//LOGGER.debug("Starting MailJob...");
		FincayraApplication.get().getMailManager().processQueue();
	}
	
}
