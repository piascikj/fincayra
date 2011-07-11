package org.innobuilt.fincayra.mail;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
import java.util.Queue;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import org.mozilla.javascript.RhinoException;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SchedulerFactory;
import org.quartz.SimpleTrigger;
import org.quartz.impl.StdSchedulerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMailMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
/*   Copyright 2010 Jesse Piascik
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/
public class MailManager {
	private Logger LOGGER = LoggerFactory.getLogger(MailManager.class); 
	private Queue<MimeMailMessage> q = new LinkedList<MimeMailMessage>();
	private JavaMailSender mailSender;
	
	/**
	 * <p>Initialize the MailManager with it's own MergeEngine instance.
	 * MergeEngine shares topScope and jsDir with main MergeEngine, but has a different pageDir.
	 * @throws IOException 
	 * @throws RhinoException 
	 */
	public void init() throws RhinoException, IOException {
        SchedulerFactory sf = new StdSchedulerFactory();
        try {
			Scheduler sched = sf.getScheduler();
	        
	        if(!sched.isStarted()) {
				JobDetail job = new JobDetail("MailJob1", "MailJobGroup", MailJob.class);
				//TODO make this configurable through spring properties
		        //Run the job every twenty seconds
		        SimpleTrigger trigger = new SimpleTrigger("MailTrigger",
	                    null,
	                    new Date(),
	                    null,
	                    SimpleTrigger.REPEAT_INDEFINITELY,
	                    20L * 1000L);
				
				sched.scheduleJob(job, trigger);
				sched.start();
	        }
		} catch (SchedulerException e) {
			LOGGER.error("Unable to get Quartz Scheduler", e);
		}
		
	}
	
	public void send(MimeMailMessage msg) {
		LOGGER.debug("Adding message to queue.");
		q.add(msg);
	}

	protected void processQueue() {
		if(!q.isEmpty()) {
			LOGGER.debug("Found {} messages.  Polling the mail queue...", q.size());
			
			ArrayList<MimeMessage> messages = new ArrayList<MimeMessage>();
			//TODO Make configurable
			//Only do 100 at a time
			int i=0;
			while(!q.isEmpty() && i < 100) {
				messages.add(q.poll().getMimeMessage());
				i++;
			}

			LOGGER.debug("mimeList size={}",Integer.toString(messages.size()));
			MimeMessage[] mm = new MimeMessage[messages.size()];
			mailSender.send(messages.toArray(mm));
		}
	}

	public MimeMailMessage createMessage(boolean multiPart) throws MessagingException {
		MimeMessage mimeMessage = mailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, multiPart, "UTF-8");
		return new MimeMailMessage(helper);
	}

	public void setMailSender(JavaMailSender mailSender) {
		this.mailSender = mailSender;
	}

	public JavaMailSender getMailSender() {
		return mailSender;
	}
	
}
