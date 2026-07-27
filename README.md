
```markdown
# MODX Docker Project by Pixmill

## Скачивание проекта из Gitlab

```bash
git clone https://github.com/bezumkin/modx-docker.git ./NewProject
```

---

## Подготовка Docker

Если у вас нет Docker, установите его с помощью команды:

```bash
brew install docker --cask
```

Затем запустите приложение Docker Desktop из папки `Applications`.

Перейдите в директорию Docker:

```bash
cd ./NewProject/docker
```

Подготовьте переменные окружения:

```bash
cp .env.dist .env
```

Не забудьте указать уникальное имя проекта в переменной `COMPOSE_PROJECT_NAME`.

И запустите контейнеры:

```bash
./start.sh
```

Первый запуск займет около 5–10 минут, пока Docker загружает образы и собирает контейнеры.

---

## Установка MODX

Если вы запускаете этот проект впервые, вам необходимо установить MODX с настройками по умолчанию. Выполните:

```bash
./modx-install.sh
```

Это установит MODX версии, указанной в переменной `MODX_VERSION`, стандартные пакеты и создаст специальный плагин `Assets`.

---

## ⚠️ Важно для MODX 2.8.5+

В версиях MODX 2.8.5 и выше есть проблема, связанная с [этим PR](https://github.com/modxcms/revolution/pull/16201).

Если вы установили эту версию, откройте файл `core/config/config.inc.php` и измените строку `66`, чтобы проверка порта была не такой строгой.

**Было:**

```php
if ($_SERVER['SERVER_PORT'] !== 80) {
```

**Стало:**

```php
if ($_SERVER['SERVER_PORT'] != 80) {
```

Это решит проблему с некорректными адресами.

---

## Как вести разработку

Откройте в браузере [http://127.0.0.1:8080](http://127.0.0.1:8080) — вы увидите сайт на MODX.

Ваши фронтенд-ресурсы находятся в директории `NewProject/assets` и обрабатываются Vite в режиме разработки. При изменении файлов фронтенд будет пересобираться и перезагружаться автоматически.

Если вам нужно что-то изменить в MODX, зайдите в `/manager`, используя логин `admin` и пароль `adminadmin`.

Когда закончите работу, выполните:

```bash
./modx-backup.sh
```

чтобы сохранить изменения для Git.

Затем вы можете остановить контейнеры командой:

```bash
./stop.sh
```

---

## Сборка для продакшена

Если вы хотите выгрузить собранные файлы на продакшен-сервер, выполните:

```bash
./modx-build.sh
```

Это соберет фронтенд-бандл и скопирует PHP-исходники с файлами данных Gitify в корневую папку `/dist`.

Теперь вы можете загрузить содержимое папки `/dist` в корень сайта MODX на сервере.

---

## Замечание для Windows

Хотя Docker хорошо работает на Windows, запустить bash-скрипт без установки WSL 2 или других дополнительных инструментов не получится.

Поэтому вам потребуется выполнять команды напрямую внутри контейнера PHP. Откройте Docker Desktop, нажмите на контекстное меню контейнера `php-fpm` и используйте команды из скриптов.

Например, вот единая команда для установки MODX (все в одной строке):

```bash
export $(cat ./.env | sed 's/\r$//')

gitify modx:download 2.8.4-pl

php setup/cli-install.php --database_server=mariadb \
  --database=$MARIADB_DATABASE --database_user=$MARIADB_USERNAME --database_password=$MARIADB_PASSWORD \
  --table_prefix=modx_ --language=en --cmsadmin=admin --cmspassword=adminadmin --cmsadminemail=admin@localhost \
  --context_mgr_path=/modx/manager/ --context_mgr_url=/manager/ \
  --context_connectors_path=/modx/connectors/ --context_connectors_url=/connectors/ \
  --context_web_path=/modx/

rm -rf ./core/cache && gitify build

gitify package:install --all
```
```