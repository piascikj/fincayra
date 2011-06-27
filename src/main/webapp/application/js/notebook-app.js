
function toggleSpinner(action, msg) {	
	var header = $('#header'); 
	var spinner = $('#spinner');
	spinner.find("p").html(msg || "Sending Request...");
	var top = header.offset().top + header.outerHeight() - 4;
	var left = (header.offset().left + header.outerWidth())/2;
	left = left - (spinner.outerWidth()/2);
	var css = {top:top + "px", left:left + "px", zIndex:1000};
	spinner.css(css);
	if (action == "show") {
		spinner.show();
	} else if (action == "hide") {
		spinner.hide();
	} else {
		spinner.toggle();
	}
}
function getTopics(uuid) {
	var topics = [];
	fincayra.topics = {};
	$.getJSON(fincayra.getTopics.tokenize(uuid),function(data) {
		$.each(data.results, function(key, val) {
			fincayra.topics[val.uuid] = val;
			topics.push(val);
		});
	});
	return topics;
}

function getTopic(id) {
	$.getJSON(fincayra.getTopic.tokenize(id),function(data) {
		fincayra.topics[data.uuid] = data;
		fincayra.topic = data;
	});
	return fincayra.topic;
}

function getFirstTopic() {
	if (fincayra.noteBook.topics && fincayra.noteBook.topics.length > 0) {
		return fincayra.topics[fincayra.noteBook.topics[0]];
	} else {
		return undefined;
	}
}

function confirmDelete(title, message, okCallback) {
	var confirm = $("#dialog_confirm").attr("title", title);
	$("#confirm_message").html(message);
	confirm.dialog({
		resizable: false,
		height:160,
		width:400,
		modal: true,
		buttons: {
			OK: function() {
				okCallback();
				$( this ).dialog( "close" );
				$( this ).dialog( "destroy" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
				$( this ).dialog( "destroy" );
			}
		}
	});	
};

function initEditor() {
	fincayra.markDownEditor = $('#markdown');
	fincayra.markDownEditor.keyup(function(e) {
		fincayra.edited = true;
		var c = e.keyCode;
		$log("key pressed:",c);
		if ((c == 32 || c == 8 || c == 46 || c == 13) || fincayra.entry.text != fincayra.markDownEditor.val()) {
			$('.saveButton a').css({'backgroundImage':'url(/js/markitup/sets/markdown/images/disk.png)'});			
		} else {
			$('.saveButton a').css({'backgroundImage':'url(/js/markitup/sets/markdown/images/disk-saved.png)'});
		}
	});
	fincayra.markDownEditor.markItUp(mySettings);
	$(".markItUpHeader").append('<div id="last_saved_entry" style="float:right; padding-right:35px; display:none;">Last Saved: <span id="last_saved_entry_time"></span></div>');
	
	fincayra.lastSavedEntry = $('#last_saved_entry');
	fincayra.lastSavedEntryTime = $('#last_saved_entry_time');
	
	fincayra.markDownEditor.live("dblclick", closeEntry);
	fincayra.editor = $('#entry_editor');
	fincayra.editor.detach();
	
}
function bindLiveHandlers() {
	//event handlers
	//bind click to all topics, now and in future
	$('.topic-link').live('click',function() {
		uuid = $(this).closest('li').attr("id");
		fincayra.topicView.displayTopic(fincayra.topics[uuid], true);
		return false;
	});
	
	
	$('#new_entry').live('click',fincayra.entryView.newEntry);
	$(document).bind('keydown', 'Ctrl+e', fincayra.entryView.newEntry);
	
	$('.entry_delete').live("click", function() {
		var el = $(this).parents(".entry");
		var entry = el.data("object");
		confirmDelete("Delete Entry", 'Do you realy want to delete this Entry?',
		function() {
			$.ajax({
				type: "DELETE",
				url: fincayra.deleteEntry.tokenize(entry.id),
				success: function(data) {
					el.remove();
					fincayra.entries[entry.uuid] = undefined;
					getTopic(fincayra.topic.id);
				},
				dataType: 'json'
			});
		});		
	});

	
	$('.entry-body a').live('click', function(e) {
		e.stopPropigation();
		return true;
	});
	
	
	$('.entry-body').live('dblclick',function() {
		editEntry($(this).closest(".entry"));
	});
	
	$('.entry_collapse').live("click", function() {
		var el = $(this).closest('.entry')
		el.find('.entry-body').hide("slide",{direction:"up"},500);
		el.find('.entry_collapse').hide();
		el.find('.entry_expand').show();
	});
	
	$('.entry_expand').live("click", function() {
		var el = $(this).closest('.entry')
		el.find('.entry-body').show("slide",{direction:"up"},500);
		el.find('.entry_collapse').show();
		el.find('.entry_expand').hide();
	});

	$('.entry_edit').live("click", function() {
		editEntry($(this).closest(".entry"));
	});
	
	$('.entry_print').live("click", function() {
		var el = $(this).closest(".entry");
		//TODO create entryView object to handle finding the element from child and other stuff
		el.printElement({printMode:'iframe'});
	});
	
	$('.entry_toc').live("click", function() {
		var entry = $(this).closest(".entry");
		toggleTOC(entry);
	});
	
	$('.entry-toc a').live("click", function() {
		var entry = $(this).closest('.entry')
		var eBody = entry.find('.entry-body');
		if(eBody.is(':hidden'))	{
			eBody.show();
			entry.find('.entry_collapse').show();
			entry.find('.entry_expand').hide();
		}
		return true;
	});
	
	$('#markdown_help').live("click", fincayra.topicView.markDownHelp);
	$(document).bind('keydown', 'Ctrl+h', function(evt) {
		fincayra.topicView.markDownHelp();
		evt.stopPropagation( );  
		evt.preventDefault( );
		return false;			
	});
	
}	
function init() {
	//Tipsy for icon-button
	$(".icon-button").tipsy({gravity:'s', live:true, fade:true, delayIn:300});
	
	$(".tip").tipsy({gravity:'s', live:true, fade:true, delayIn:300});
	
	//Set up converter
	fincayra.showdown = new Showdown.converter();

	//Create the Views
	fincayra.topicView = new TopicView();
	fincayra.noteBookView = new NoteBookView();
	fincayra.entryView = new EntryView();

	bindLiveHandlers();

	//No asynch
	$.ajaxSetup({async:false,contentType:"application/json"});
	
	//setup the layout
	fincayra.layout = $('#notebooks-app').layout({
		defaults : {
			applyDefaultStyles: true,
			contentSelector:".ui-layout-content"
		},
		
		west : {
			slidable: true,
			size: 260,
			onresize: function () {
				$('#notebook_list').accordion('resize');
			}
		}
	});
	
	//disable submit
	$('#notebooks-app').find('form').each(function() {
		$(this).submit(function() {return false;});
	});
	
	//Display default Values in fields
	$(" [placeholder] ").defaultValue();
	
	//store the editor and detach it
	initEditor();
	
	//display the notebooks
	fincayra.noteBookView.displayNoteBooks();
	
	//Save entry if open
	setInterval(function () {
		try {
			$log("Running autosave interval function");
			if (fincayra.entry && fincayra.edited) { 
				$log("Auto svaing entry.");
				saveEntry();
			}
		} catch (e) {
			$log("Caught exception during autosave interval", e);
		}
	},fincayra.autoSaveIncrement);

	//Display the lastTopice viewed
	fincayra.topicView.getLastTopic(true);

}

function editEntry(el) {
	closeEntry();
	el.before(fincayra.editor);
	el.hide();
	fincayra.editor.show();
	fincayra.entry = el.data('object');
	$('#markdown').val(fincayra.entry.text).focus();
	return false;
}	

function getTOC(entry) {
	var toc = entry.find('.entry-toc');
	toc.html("");
	var entryId = entry.attr("id");
	toc.toc({context:'#' + entryId + ' > .entry-body'});
	return toc;
};

function toggleTOC(entry) {
	var toc = getTOC(entry);
	toc.toggle();
}

function getNoteBooks() {
	$.getJSON(fincayra.getNoteBooks,function(data) {
		fincayra.noteBook = undefined;
		fincayra.noteBooks = {};
		
		$.each(data.results, function(key, val) {
			fincayra.noteBooks[val.uuid] = val;
		});
				
		fincayra.noteBookView.list.accordion("destroy");

		fincayra.noteBookView.nameBox.hide();
		
		fincayra.noteBookView.displayNoteBooks();
	});
}

function saveNoteBook(noteBook) {
	var e, type = (noteBook.uuid)?"POST":"PUT";
	$.ajax({
		type: type,
		url: fincayra.saveNoteBook,
		data: JSON.stringify(noteBook),
		success: function(data) {
			$log("NoteBook returned from save!",data);
			fincayra.noteBooks[data.uuid] = data;
			fincayra.noteBook = fincayra.noteBooks[data.uuid];
			if (type == "PUT") fincayra.topic = undefined;
		},
		error: function(data) {
			$log("returned error from notebook save", data);
			e = JSON.parse(data.responseText).error;
			$log("Error:", e);
		},
		dataType: 'json'
	});
	
	if (e) throw e;
	
	return fincayra.noteBook;
}

function saveTopic(topic) {
	$log("Saving topic", topic);
	var e, type = (topic.uuid)?"POST":"PUT";
	$.ajax({
		type: type,
		url: fincayra.saveTopic,
		data: JSON.stringify(topic),
		success: function(data) {
			fincayra.topic = data;
			fincayra.topics[topic.uuid] = data;
		},
		error: function(data) {
			$log("returned error from topic save", data);
			e = JSON.parse(data.responseText).error;
			$log("Error:", e);
		},
		dataType: 'json'
	});
	
	if (e) throw e;
	
	return fincayra.topic;
}

function parseMD(text) {
	return fincayra.showdown.makeHtml(text);
}

function getEntries() {
	var entries = $('#entries');
	entries.html('');
	fincayra.entry = undefined;
	$.ajax({
		async: false,
		type: "GET",
		url: fincayra.getEntries.tokenize(fincayra.topic.uuid),
		success: function(data) {
			
			if (fincayra.topic.entries && fincayra.topic.entries.length > 0) {
				fincayra.entries = {};
				$.each(data.results, function(key, val) {
					fincayra.entries[val.uuid] = val;
				});
				$.each(fincayra.topic.entries, function(key, val) {
					var entry = getEntryElement(fincayra.entries[val]);
					entries.append(entry);
				});
			} else {
				$.each(data.results, function(key, val) {
					var entry = getEntryElement(val);
					entries.append(entry);
				});
			}

			$('#entries').sortable({
				axis:"y",
				handle:".entry-header",
				//Save the new sort order when a topic is moved
				stop: function(e, ui) {
					fincayra.topic.entries = $('#entries').sortable( "toArray" );
					saveTopic(fincayra.topic);
				}
				
			});

			highlight();
			fincayra.layout.initContent("center",true);
			
			fincayra.entryView.jumpToEntry();
		}
	});
	
}

function highlight() {
	$('.entry pre code').each(function(i, e) {hljs.highlightBlock(e, '    ')});
}

function getDateString(date) {
 return date.format("EE MMM d, yyyy h:mm:ss a");
}

function getEntryElement(entry) {
	var jqo = $('#' + entry.uuid);
	var title = fincayra.truncate(entry.text.split("\n")[0],100,"...");
	if (jqo.length == 0) {
		var date = getDateString(new Date(entry.createDate));
		var html = $("#entry_tmpl").jqote({
			id:entry.uuid,
			date: date,
			title: title
		});
		jqo = $(html);
	} else {
		jqo.find('.entry-title').html(title);
	}
	var html = parseMD(entry.text);
	jqo.find('.entry-body').html(html);
	//$log("jqo=" + $("#entry_tmpl").text());
	return jqo.data({object:entry, html:html});
}

function $log(message, obj) {
	if (fincayra.dev && window.console) {
		console.log(message);
		if (obj) console.log(JSON.stringify(obj, null, "   "));
	}
}

function saveEntry() {
	var type;
	if (fincayra.entry.uuid) {
		type = "POST";
	} else {
		type = "PUT";
	}
	fincayra.entry.text = $('#markdown').val();
	$log("saving entry:",fincayra.entry);
	fincayra.lastSavedEntry.hide();
	toggleSpinner("show", "Saving Entry...");
	$.ajax({
		async: true,
		type: type,
		url: fincayra.saveEntry,
		data: JSON.stringify(fincayra.entry),
		success: function(data) {
			var entry = data;
			$log("Entry returned from save!",entry);
			var el = $('#' + data.uuid);
			fincayra.entry = entry;
			fincayra.entries[entry.uuid] = entry;
			//This is a new entry
			if (el.length < 1) {
				$log("This is a new Entry");
				if (fincayra.topic.entries)	fincayra.topic.entries.unshift(entry.uuid);
				saveTopic(fincayra.topic);
				$log("Done saving topic");
				el = getEntryElement(entry);
				el.css({display:"none"});
				$log("Appending entry", el.html());
				$('#entries').prepend(el);
			}
			$log("Entry saved",entry);
			$('.saveButton a').css({'backgroundImage':'url(/js/markitup/sets/markdown/images/disk-saved.png)'});
			fincayra.lastSavedEntryTime.html(getDateString(new Date()));
			fincayra.lastSavedEntry.show();
			fincayra.edited = false;
			toggleSpinner("hide");
		},
		dataType: 'json'
	});
}

function closeEntry() {
	if (fincayra.entry && fincayra.entry.uuid) {
		var el = getEntryElement(fincayra.entry).show();
		getTOC(el);
	}
	fincayra.entry = undefined;
	fincayra.lastSavedEntry.hide();
	fincayra.edited = false;
	fincayra.editor.detach();
	highlight();
}

function NoteBookView() {
	var $this = this;
	this.list = $('#notebook_list');
	this.name = $('#notebook_name');
	this.nameBox = $('#notebook_name_box');
	this.nameDisplay = $('#notebook_name_display');
	this.nameForm =	$('#notebook_name_form');
	this.nameInput = $('#notebook_name_edit');
	this.noteBookContainer = $('#notebook_container');
	this.appHeader = $('#notebooks_app_header');
	
	this.newButton = $('#new_notebook');
	this.deleteButton = $('#notebook_delete');
	this.okButton = $('#notebook_ok');
	this.cancelButton = $('#notebook_cancel');
	
	this.noteBook;  //The notebook to display
	
	this.newClick = function(event) {
		fincayra.noteBook = undefined;
		fincayra.topic = undefined;
		fincayra.topicView.hideTopic();
		$this.deactivate();
		$this.nameBox.show();
		fincayra.topicView.nameBox.hide();
		$this.nameDisplay.hide();
		$this.nameForm.show();
		$this.nameInput.val("New NoteBook").select().focus();
		return false;
	};
	
	this.newButton.click(this.newClick);
	$(document).bind('keydown', 'Ctrl+b', function(evt) {
		$this.newClick();
		evt.stopPropagation( );  
		evt.preventDefault( );
		return false;	
	});
	
	this.nameClick = function() {
		$this.nameBox.show();
		$this.nameDisplay.hide();
		$this.nameInput.val(fincayra.noteBook.name);
		$this.nameForm.show();
		$this.nameInput.focus();
		return false;
	};
	
	this.name.click(this.nameClick);
	
	this.deleteClick = function() {
		confirmDelete("Delete NoteBook", 'Do you realy want to delete "{}"?'.tokenize(fincayra.noteBook.name),
		function() {
			$.ajax({
				type: "DELETE",
				url: fincayra.deleteNoteBook.tokenize(fincayra.noteBook.id),
				success: function(data) {
					getNoteBooks();
					fincayra.topicView.hideTopic();
				},
				dataType: 'json'
			});
		});		
	};
	
	this.deleteButton.click(this.deleteClick);
	
	this.okClick = function() {
		var topic;
		try {
			if (fincayra.noteBook) {
				var noteBook = {};
				$.extend(noteBook,fincayra.noteBook);
				noteBook.name = $this.nameInput.val();
				saveNoteBook(noteBook);
				$('#' + noteBook.uuid).text(fincayra.noteBook.name);
				$this.name.html(fincayra.noteBook.name);
				$this.nameDisplay.show();
				$this.nameForm.hide();
			} else {
				var noteBook = {name:$this.nameInput.val(),owner:fincayra.user};
				saveNoteBook(noteBook);
				$.extend(noteBook,fincayra.noteBook);
				getNoteBooks();
				fincayra.noteBookView.displayNoteBook(noteBook);
			}
		} catch (error) {
			$log("Caught exception while saving notebook", error);
			var title;
			if (error && error.violations && error.violations.name) title = error.violations.name;
			$this.nameInput.attr('title',title);
			$this.nameInput.tipsy({
				trigger:'focus',
				gravity:'s'
			});
			$this.nameInput.select().focus();
		}

		return false;
	};
	
	this.okButton.click(this.okClick);
	
	this.cancelClick = function() {
		if (fincayra.noteBook) {
			$this.name.text(fincayra.noteBook.name);
			$this.nameDisplay.show();
			$this.nameInput.val(fincayra.noteBook.name);
			$this.nameForm.hide();
		} else {
			$this.nameBox.hide();
			fincayra.topicView.getLastTopic(true);
		}
		return false;
	};
	
	this.cancelButton.click(this.cancelClick);

	this.displayNoteBooks = function() {
		//Get the notebook data
		var items = [];
		$.each(fincayra.noteBooks, function(key, val) {
			items.push('<h3><a href="#" id="{}">{}</a></h3><div></div>'.tokenize(key,val.name));
		});
		
		
		$this.list.html(items.join('')).accordion({
			active:false,
			header:'h3',
			changestart:function(event, ui) {
				toggleSpinner("show");
				//setting a timer to allow spinner to show
				setTimeout(function() {
					var uuid = ui.newHeader.find('a').attr('id');
					fincayra.noteBook = fincayra.noteBooks[uuid] || $this.noteBook;
					if (fincayra.noteBook) {
						$log("Activating notebook:" + fincayra.noteBook.name);
						$('#entries').html('');
						fincayra.topicView.hideTopic();
						$this.nameForm.hide();
						$this.nameBox.show();
						$this.name.text(fincayra.noteBook.name);
						$this.nameDisplay.show();
						
						var topicItems = [];
						var topics = getTopics(uuid);
						var topicTmpl = '<li id="{}"><span title="Drag and drop sort" class="tip ui-icon ui-icon-arrowthick-2-n-s"></span><a href="#" class="topic-link">{}</a></li>';
						
						if (fincayra.noteBook.topics && fincayra.noteBook.topics.length > 0) {
							//If there is a custom sort we use it
							$.each(fincayra.noteBook.topics, function(key, val) {
								if (fincayra.topics[val]) {
									topicItems.push(topicTmpl.tokenize(val,fincayra.topics[val].name));
								}
							});
						} else {
							//If not we sort alphabetically
							$.each(topics, function(key, val) {
								topicItems.push(topicTmpl.tokenize(val.uuid,val.name));
							});
						}
						
						//Add the topics to the content
						ui.newContent.html('<ul>' + topicItems.join('') + '</ul>');
						ui.newContent.find('ul').sortable({
							start: function(e, ui) {
								ui.item.find('.tip').tipsy(true).hide();
								//ui.item.closest('ul').find('.tip').tipsy(true).disable();
							},
							//Save the new sort order when a topic is moved
							stop: function(e, ui) {
								fincayra.noteBook.topics = ui.item.closest('ul').sortable( "toArray" );
								saveNoteBook(fincayra.noteBook);
								//ui.item.closest('ul').find('.tip').tipsy(true).enable();
							},
							
							update: function(e, ui) {
								//ui.item.closest('ul').find('.tip').tipsy(true).enable();
							},
							axis:"y",
							handle:"span"
						});
						//add the new topic link to the content
						ui.newContent.prepend('<p><a href="#" title="Add a Topic to this NoteBook." class="tip new-topic new-link"><span class="ui-icon ui-icon-folder-collapsed icon-button"></span>Create a new Topic...</a></p>');
						var topic = fincayra.topicView.lastTopic || getFirstTopic();
						$log("Preparing to display topic:" + topic.name);
						fincayra.topicView.displayTopic(topic, true);
						$this.noteBook = undefined;
					} else {
						$log("fincayra.noteBook not set");
					}
					toggleSpinner("hide");

				}, 200);

			},
			collapsible: true,
			autoHeight: false
		}).css({padding:"0 10px"});
	};

	this.displayNoteBook = function(noteBook) {
		$log("Displaying notebook:" + noteBook.name);
		$this.noteBook = noteBook;
		fincayra.noteBook = undefined;
		fincayra.topic = undefined;
		fincayra.entry = undefined;
		$this.list.accordion("activate",$("#" + noteBook.uuid).parent());
	};
	
	this.deactivate = function() {
		fincayra.noteBook = undefined;
		$this.list.accordion("activate",false);
	};

};
	
function TopicView() {
	var $this = this;
	this.nameBox = $('#topic_name_box');
	//These are the display elements
	this.nameDisplay = $('#topic_name_display');
	this.name = $('#topic_name');
	this.deleteButton = $('#topic_delete');
	this.tocButton = $('#topic_toc');
	
	//These are the form elements
	this.nameForm = $('#topic_name_form');
	this.nameInput = $('#topic_name_edit');
	this.okButton = $('#topic_ok');
	this.cancelButton = $('#topic_cancel');
	
	this.lastTopic = undefined;

	//Toggle toc for all Entries
	this.tocButton.live("click", function() {
		$(".entry").each(function() {
			toggleTOC($(this));
		});
	});
	
	this.displayTopic = function(topic, setLastTopic) {
		if (topic == undefined) return;
		$log("Displaying topic:" + topic.name);
		if (setLastTopic) $.getJSON(fincayra.setLastTopic.tokenize(topic.id));
		fincayra.topic = topic;
		this.nameBox.show();
		this.name.text(fincayra.topic.name);
		this.nameDisplay.show();
		this.nameInput.val(fincayra.topic.name);
		this.nameForm.hide();
		getEntries();
		
		this.lastTopic = undefined;

		return fincayra.topic;
	};

	this.hideTopic = function() {
		this.nameBox.hide();
		$('#entries').html('');
		$('#entry_editor').detach();
	};

	this.getLastTopic = function(activateNoteBook) {
		//show the lastTopic
		$.getJSON(fincayra.getLastTopic,function(data) {
			var topic = data.topic;
			if (topic) {
				fincayra.topic = topic;
				//$log("Display last topic: ", topic);
				$this.lastTopic = topic;
				if (activateNoteBook) fincayra.noteBookView.displayNoteBook(topic.noteBook);
			}
		});
	};
	
	this.markDownHelp = function() {
		if (fincayra.markdownHelp == undefined) {
			$.get("/js/help/markdown/syntax.text",function(data) {
				fincayra.markdownHelp = data;
			});
				
			$('.help-body').html(parseMD(fincayra.markdownHelp));
			var toc = $('.help-toc');
			toc.html("");
			toc.toc({context:'.help-body'});

		}
		$('.help').toggle();
		$('.ui-layout-center .ui-layout-content').scrollTop(0);
	}

	//The new topic event handler
	this.newTopic = function() {
		fincayra.topic = undefined;
		fincayra.topicView.hideTopic();
		fincayra.topicView.nameBox.show();
		fincayra.topicView.nameDisplay.hide();
		fincayra.topicView.nameForm.show();
		fincayra.topicView.nameInput.val("New Topic").select().focus();
		return false;
	}	
	$('.new-topic').live("click",$this.newTopic);
	$(document).bind('keydown', 'Ctrl+c', function(evt) {
		$this.newTopic();
		evt.stopPropagation( );  
		evt.preventDefault( );
		return false;			
	});
	
	this.topicExpand = function() {
		$('.entry-body').each(function() {
			if ($(this).is(':hidden'))
				$(this).show("slide",{direction:"up"},500);
		});
		$('.entry_collapse').each(function() {$(this).show();});
		$('.entry_expand').each(function() {$(this).hide();});
	};
	
	$('#topic_expand').live("click", $this.topicExpand);
	$(document).bind('keydown', 'Shift+down', function(evt) {
		$this.topicExpand();
		evt.stopPropagation( );  
		evt.preventDefault( );
		return false;			
	});
	
	this.topicCollapse = function() {
		$('.entry-body').each(function() {
			if ($(this).is(':visible'))
				$(this).hide("slide",{direction:"up"},500);
		});
		$('.entry_collapse').each(function() {$(this).hide();});
		$('.entry_expand').each(function() {$(this).show();});
	};
	
	$('#topic_collapse').live("click", $this.topicCollapse);	
	$(document).bind('keydown', 'Shift+up', function(evt) {
		$this.topicCollapse();
		evt.stopPropagation( );  
		evt.preventDefault( );
		return false;			
	});
	

	this.nameClick = function() {
		$this.nameBox.show();
		$this.nameDisplay.hide();
		$this.nameInput.val(fincayra.topic.name);
		$this.nameForm.show();
		$this.nameInput.focus();
		return false;
	};
	
	this.name.click(this.nameClick);

	this.okClick = function() {
		var topic, ok = true;
		try {
			if (fincayra.topic) {
				topic = {};
				$.extend(topic,fincayra.topic);
				topic.name = $this.nameInput.val();
					saveTopic(topic);
					$this.name.text(fincayra.topic.name);
					$this.nameDisplay.show();
					$this.nameForm.hide();
					
			} else {
				topic = {name:$this.nameInput.val(),owner:fincayra.user,noteBook:fincayra.noteBook};
				topic = saveTopic(topic);
			}
		} catch (error) {
			ok = false;
			$log("Caught exception while saving topic", error);
			var title;
			if (error && error.violations && error.violations.name) title = error.violations.name;
			$this.nameInput.attr('title',title);
			$this.nameInput.tipsy({
				trigger:'focus',
				gravity:'s'
			});
			//tip.tipsy(true).show();
			$this.nameInput.select().focus();
		}

		if (ok) {
			getNoteBooks();
			$this.lastTopic = topic;
			fincayra.noteBookView.displayNoteBook(topic.noteBook);
		}

		return false;
	};
	
	this.okButton.click(this.okClick);
	
	this.cancelClick = function() {
		if (fincayra.topic) {
			$this.name.text(fincayra.topic.name);
			$this.nameDisplay.show();
			$this.nameInput.val(fincayra.topic.name);
			$this.nameForm.hide();
		} else {
			$this.nameForm.hide();
			//fincayra.noteBookView.list.accordion("activate",false);
			$this.getLastTopic();
		}

		return false;
	};
	
	this.cancelButton.click(this.cancelClick);
	
	this.deleteClick = function() {
		confirmDelete("Delete Topic", 'Do you realy want to delete "{}"?'.tokenize(fincayra.topic.name),
		function() {
			$.ajax({
				type: "DELETE",
				url: fincayra.deleteTopic.tokenize(fincayra.topic.id),
				success: function(data) {
					fincayra.topic = undefined;
					uuid = fincayra.noteBook.uuid;
					getNoteBooks();
					$this.nameBox.hide();
					fincayra.noteBookView.list.accordion("activate",$("#" + uuid).parent());
				},
				dataType: 'json'
			});
		});		
	};
	
	this.deleteButton.click(this.deleteClick);

	
};

function EntryView() {
	var $this = this;
	this.searchResults = $('#search_results');
	this.searchResultsCount = $('#search_results_count');
	this.searchEntries = $('#search_entries');
	this.searchField = $("#search_field");
	this.searchForm = $("#search_form");
	
	this.searchResults.find('.ui-icon').button();
	
	this.entry = undefined;
	
	$('#search_results_toggle').click(function() {
		if($this.searchEntries.is(':hidden')) {
			$this.searchEntries.show("fade");
			$(this).removeClass("ui-icon-triangle-1-s");
			$(this).addClass("ui-icon-triangle-1-n");
		} else {
			$this.searchEntries.hide("fade");
			$(this).removeClass("ui-icon-triangle-1-n");
			$(this).addClass("ui-icon-triangle-1-s");			
		}
	});
	
	this.searchField.keyup(function(e) {
		$this.searchResults.hide();
	});
	
	this.jumpToEntry = function(entry) {
		fincayra.noteBookView.noteBookContainer.animate({scrollTop: 0}, 0);
		entry = entry || this.entry;
		var entryTop = $('#' + entry.uuid).offset().top;
		var top = entryTop - fincayra.noteBookView.appHeader.outerHeight()*2;
		$log("Scrolling to entry:{} at top:{}".tokenize(entry.uuid, top));
		fincayra.noteBookView.noteBookContainer.animate({scrollTop: top}, 100);
	};
			
	this.search = function() {
		toggleSpinner();
		var qry = $this.searchField.val();
		$this.searchEntries.html("");
		$this.searchResultsCount.html("");
		$.ajax({
			async:true,
			type: "GET",
			url: fincayra.searchEntries.tokenize(qry),
			success: function(data) {
				$this.searchResultsCount.html(data.length + " entries found.");
				$this.searchResults.show("fade");
				
				if (data.length > 0) {
					$.each(data,function(i, entry) {
						var entryDesc = fincayra.truncate(entry.text.split("\n")[0],30,"...");
						var entryItem = $('<li><a href="#" class="search_entry_link">{}</a></li>'.tokenize(entryDesc));
						var entryLink = entryItem.find('a');
						entryLink.data("entry", entry);
						$this.searchEntries.append(entryItem);
						entryLink.click(function(e) {
							var entry = $(this).data("entry");
							$log("-------------------------------");
							$log("Entry:" + entryDesc + " clicked");
							//fincayra.noteBookView.deactivate();
							$this.entry = entry;
							fincayra.topicView.lastTopic = entry.topic;
							if (fincayra.noteBook.uuid == entry.topic.noteBook.uuid) {
								fincayra.topicView.displayTopic(entry.topic, true);
							} else {
								fincayra.noteBookView.displayNoteBook(entry.topic.noteBook);
							}
							e.preventDefault();
							return false;
						});
					});
					$this.searchEntries.show();
					$this.searchEntries.find('a').first().focus();
				}
				toggleSpinner();
			},
			error: function(data) {
				toggleSpinner();
				$log("returned error from search", data);
				e = JSON.parse(data.responseText).error;
				$log("Error:", e);
			},			
			dataType: 'json'
		});		
		//alert("search");
		return false;
	};
	
	//Search form
	this.searchForm.submit($this.search);	
	
	this.newEntry = function() {
		closeEntry();
		fincayra.entry = {owner:fincayra.user,topic:fincayra.topic};
		$('#entries').prepend(fincayra.editor);
		fincayra.editor.show();
		$('#markdown').val('').focus();
		return false;
	};		
}

try {

	$(document).ready(function () {
		init();
		
	});
} catch (e) {
	$log("Caught exception:",e);
}
