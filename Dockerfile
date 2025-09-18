# Utilise l'image officielle Nginx
FROM nginx:alpine

# Copie tes fichiers web dans le répertoire par défaut de Nginx
COPY . /usr/share/nginx/html/

# Expose le port 80
EXPOSE 80

# Nginx démarre automatiquement avec l'image
