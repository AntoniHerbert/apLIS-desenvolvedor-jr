# Ficheiro: backendphp/Dockerfile

FROM php:8.2-cli

# Instalar a extensão do MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Definir o diretório de trabalho
WORKDIR /var/www/html

# Copiar todo o código PHP para o contentor
COPY . .

# Expor a porta 80 (que mapeia para a 8000 no seu docker-compose)
EXPOSE 80

# Iniciar o servidor nativo do PHP. 
# Isto obriga TUDO a passar pelo index.php automaticamente, sem precisar de .htaccess!
CMD ["php", "-S", "0.0.0.0:80", "index.php"]