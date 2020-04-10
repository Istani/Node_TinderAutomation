docker build -t node_puppeteer .
docker container rm -f tinder_automation
<<<<<<< HEAD
docker run -it --shm-size=1gb --name tinder_automation --restart always -v /media/usb/projects/Node_TinderAutomation/:/app node_puppeteer bash
=======
docker run -dit --shm-size=1gb --name tinder_automation --restart always -v //c/Dropbox/SimpleSoftwareStudioShare/Node_TinderAutomation/:/app node_puppeteer
>>>>>>> 7818faf23a2c4f1a8ec440b2f97a9ee0eaf8e87d
