docker build -t node_puppeteer .
docker container rm -f tinder_automation
docker run -it --shm-size=1gb --name tinder_automation --restart always -v /media/usb/projects/Node_TinderAutomation/:/app node_puppeteer bash
