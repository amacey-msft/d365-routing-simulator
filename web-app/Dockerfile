FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets
COPY index.html /usr/share/nginx/html/index.html
COPY dataverse.js /usr/share/nginx/html/dataverse.js

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
