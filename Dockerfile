FROM node:latest
RUN  apt-get update

#Puppeteer
RUN apt-get install -y wget --no-install-recommends
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt-get install -y google-chrome-unstable --no-install-recommends
RUN rm -rf /var/lib/apt/lists/*
RUN wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh
RUN chmod +x /usr/sbin/wait-for-it.sh
RUN npm i puppeteer
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser
RUN mkdir -p /home/pptruser/Downloads
RUN chown -R pptruser:pptruser /home/pptruser
RUN chown -R pptruser:pptruser /node_modules
RUN chown -R 999:999 "/root/.npm"

# puppeteer versuch 2
#RUN apt-get install -yyq ca-certificates
#RUN apt-get install -yyq libappindicator1 libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6
#RUN apt-get install -yyq gconf-service lsb-release wget xdg-utils
#RUN apt-get install -yyq fonts-liberation 

CMD su pptruser -c "cd /app && node app.js"