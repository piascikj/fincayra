package org.innobuilt.fincayra;

import java.io.IOException;

import org.apache.commons.vfs.FileChangeEvent;
import org.apache.commons.vfs.FileListener;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.RhinoException;
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
public class FincayraFileListener implements FileListener{

	@Override
	public void fileChanged(FileChangeEvent arg0) throws Exception {
		loadRootScope();
		
	}

	@Override
	public void fileCreated(FileChangeEvent arg0) throws Exception {
		loadRootScope();
		
	}

	@Override
	public void fileDeleted(FileChangeEvent arg0) throws Exception {
		loadRootScope();
		
	}
	
	private void loadRootScope() {
		try {
			Context.exit();
		} catch (Exception e){
			//Swallow it!!!
		}
		try {
			FincayraApplication.get().getMergeEngine().init(false);
		} catch (RhinoException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			FincayraApplication.get().getMailManager().init();
		} catch (RhinoException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}