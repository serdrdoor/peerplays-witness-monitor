FROM node:8
LABEL peerplays-witness-monitor=1.0.0

ARG inner_folder=/usr/src/app

RUN mkdir -p ${inner_folder}
WORKDIR ${inner_folder}

COPY package.json ${inner_folder}
RUN npm install

COPY index.js  ${inner_folder}
RUN mkdir ${inner_folder}/config
COPY config/* ${inner_folder}/config/

CMD ["node","index.js"]