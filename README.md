# wsWebDisplay

### Getting Started
In order to get wsWebdisplay up and running, follow these steps:

1) follow the instructions on the [wsBroadcast Readme](https://github.com/aprsworld/wsBroadcast/blob/master/README.md)

2) Download the ZIP file from github, and extract it to a folder
### Things to note

1) Config.js 
    
    This file controls core functionality of the software with various constants. The default host, port, page title, and   
    default layout can all be set in this file.
    
2) URL format

   - The default URL format is   
        [http://HOST:PORT/]()  
        Example: http://pcwx-deploy-test.aprsworld.com
   - If a certain configuration is desired, the configuration name is appended to the end of the url  
        [http://HOST:PORT/CONFIGNAME]()  
        Example: http://pcwx-deploy-test.aprsworld.com/K0NY
    - Certain parts of the page can be temporarily changed with the URL such as the page title, host and port.  
        [http://HOST:PORT/CONFIGNAME?OPTION=VALUE]()  
        example: http://pcwx-deploy-test.aprsworld.com/K0NY?port=8888   
        
3) Edit Window 

    - Click the pencil symbol in the lower right hand corner of the page to bring up the edit window. This allows for editing of the wsWebDisplay page.
    
    
4) Adding Elements to page

    - When in edit mode, a file-tree will be visible on the left-hand side of the screen. Certain elements will have an arrow (sharing icon) next to them. When this arrow is clicked, the element will attach to the user's mouse and a second click will add the element to the page at the mouse cursor's position.
    
    
5) Saving and Loading

    - After doing some editing, the current page may be saved for later use. This can be done in the edit window (see above) by pressing the configurations button.
    

