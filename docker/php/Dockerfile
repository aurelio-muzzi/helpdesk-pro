FROM php:8.4-fpm-alpine

# Instala dependências de sistema
RUN apk update && apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    oniguruma-dev \
    icu-dev \
    linux-headers \
    $PHPIZE_DEPS

# Instala extensões PHP essenciais
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd intl zip opcache

# Instala extensão Redis
RUN pecl install redis && docker-php-ext-enable redis

# Instala Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configuração de usuário e diretório de trabalho
WORKDIR /var/www/backend

EXPOSE 9000
CMD ["php-fpm"]
