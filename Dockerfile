FROM node:18-alpine

# Define build arguments
ARG VITE_APP_API_BASE_URL
ARG VITE_APP_GOOGLE_API_KEY

# Set environment variables during the build process
ENV VITE_APP_API_BASE_URL=$VITE_APP_API_BASE_URL
ENV VITE_APP_GOOGLE_API_KEY=$VITE_APP_GOOGLE_API_KEY

RUN mkdir -p /usr/src/web-app

WORKDIR /usr/src/web-app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

RUN yarn global add serve

EXPOSE 3000

CMD ["serve", "-s", "./dist"]