# A consistent environment for running tests within
FROM nodesource/precise:4.6.0

ENV DEBIAN_FRONTEND=noninteractive
ENV CXX=g++-4.8

# add apt repo
RUN apt-get update -qq
RUN apt-get install -qq software-properties-common python-software-properties
RUN add-apt-repository -y ppa:ubuntu-toolchain-r/test
RUN apt-get update -qq

# canvas npm package dependencies
RUN apt-get install -qq \
  libcairo2-dev \
  libjpeg8-dev \
  libpango1.0-dev \
  libgif-dev \
  libpng-dev \
  build-essential \
  g++-4.8

# display cairo version
RUN apt-cache show libcairo2-dev

ENV NODE_ENV=dev

COPY . /usr/src/app/
RUN npm install
CMD node --version && \
    npm --version && \
    npm run build && \
    npm run test && \
    npm run lint && \
    npm run lint_tests
