
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Monitor, LaptopMac } from "lucide-react";

const DownloadGuide = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Download Guide</h1>
        <p className="text-muted-foreground">
          How to download and use your distillery management system
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Downloading Your TTB Reports
          </CardTitle>
          <CardDescription>
            Guide to downloading TTB forms and application files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="windows">
            <TabsList className="mb-6">
              <TabsTrigger value="windows">Windows</TabsTrigger>
              <TabsTrigger value="mac">Mac</TabsTrigger>
              <TabsTrigger value="files">TTB Forms</TabsTrigger>
            </TabsList>
            
            <TabsContent value="windows">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Using the Web Application on Windows</h3>
                  <p className="text-muted-foreground mt-1">
                    The Distillery Management System is a web application that runs directly in your browser.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Option 1: Bookmark the Application</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+D</kbd> while on the application page</li>
                    <li>Name your bookmark "Distillery Management"</li>
                    <li>Access the application anytime by clicking on your bookmark</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Option 2: Create a Desktop Shortcut</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>In Chrome or Edge, click the three dots menu in the top right</li>
                    <li>Select "More tools" → "Create shortcut"</li>
                    <li>Check "Open as window" for an app-like experience</li>
                    <li>Click "Create" to add the shortcut to your desktop</li>
                  </ol>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="mac">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Using the Web Application on Mac</h3>
                  <p className="text-muted-foreground mt-1">
                    Access the Distillery Management System easily on your Mac.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Option 1: Bookmark the Application</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Press <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘+D</kbd> while on the application page</li>
                    <li>Name your bookmark "Distillery Management"</li>
                    <li>Access the application anytime from your bookmarks bar or menu</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Option 2: Create a Desktop App</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>In Chrome, click the three dots menu in the top right</li>
                    <li>Select "More tools" → "Create shortcut"</li>
                    <li>Check "Open as window" for an app-like experience</li>
                    <li>The app will appear in your Applications folder and Launchpad</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Option 3: Dock the Application</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>After creating a desktop app (Option 2)</li>
                    <li>Open the application</li>
                    <li>Right-click on its icon in the dock</li> 
                    <li>Select "Options" → "Keep in Dock"</li>
                  </ol>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="files">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Downloading TTB Forms</h3>
                  <p className="text-muted-foreground mt-1">
                    Access and save your completed TTB forms for submission.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Downloading TTB Form 5110.11</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Navigate to the "Form 5110.11" page in the application</li>
                    <li>Fill out all required information or verify existing data</li>
                    <li>Click the "Download PDF" button in the top-right corner</li>
                    <li>The file will download automatically to your default downloads folder</li>
                    <li>File naming convention: TTB_5110_11_YYYY-MM.txt</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Downloading TTB Form 5110.28</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Navigate to the "Form 5110.28" page in the application</li>
                    <li>Fill out all required information or verify existing data</li>
                    <li>Click the "Download PDF" button in the top-right corner</li>
                    <li>The file will download automatically to your default downloads folder</li>
                    <li>File naming convention: TTB_5110_28_YYYY-MM.txt</li>
                  </ol>
                </div>
                
                <div className="rounded-md bg-blue-50 border border-blue-200 p-4 text-blue-700">
                  <div className="flex items-start">
                    <Monitor className="h-5 w-5 mt-0.5 mr-2" />
                    <div>
                      <p className="font-medium">Note about TTB forms</p>
                      <p className="text-sm">
                        Currently, the downloaded forms are text files containing report data. In a future update, 
                        these will be converted to properly formatted PDF files that match the official TTB format.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-amber-700 mt-4">
                  <div className="flex items-start">
                    <LaptopMac className="h-5 w-5 mt-0.5 mr-2" />
                    <div>
                      <p className="font-medium">Printing TTB Forms</p>
                      <p className="text-sm">
                        You can also print forms directly from the application by clicking the "Print" 
                        button. This opens your browser's print dialog where you can select your printer
                        or save as PDF.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadGuide;
