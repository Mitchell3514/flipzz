@ECHO OFF
echo Starting gulp compiling. 
CMD /c gulp build 
echo Finished initial build, launching gulp watch in the background. 
start /min CMD /c gulp dev 
echo Now starting server 
sleep 1 
nodemon 
exit 0