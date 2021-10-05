Docker Guide
================================================================

This guide describes how to install and setup Misskey with Docker.

- [Japanese version also available - 日本語版もあります](./docker.ja.md)
- [Simplified Chinese version also available - 简体中文版同样可用](./docker.zh.md)

----------------------------------------------------------------

*1.* Download Misskey
----------------------------------------------------------------
1. Clone Misskey repository's master branch.

	`git clone -b master git://github.com/misskey-dev/misskey.git`

2. Move to misskey directory.

	`cd misskey`

3. Checkout to the [latest release](https://github.com/misskey-dev/misskey/releases/latest) tag.

	`git checkout master`

*2.* Configure Misskey
----------------------------------------------------------------

Create configuration files with following:

```bash
cd .config
cp example.yml default.yml
cp docker_example.env docker.env
```

### `default.yml`

Edit this file the same as non-Docker environment.  
However hostname of Postgresql, Redis and Elasticsearch are not `localhost`, they are set in `docker-compose.yml`.  
The following is default hostname:

| Service       | Hostname |
|---------------|----------|
| Postgresql    | `db`     |
| Redis         | `redis`  |
| Elasticsearch | `es`     |

### `docker.env`

Configure Postgresql in this file.  
The minimum required settings are:

| name                | Description   |
|---------------------|---------------|
| `POSTGRES_PASSWORD` | Password      |
| `POSTGRES_USER`     | Username      |
| `POSTGRES_DB`       | Database name |

*3.* Configure Docker
----------------------------------------------------------------
Edit `docker-compose.yml`.

*4.* Build Misskey
----------------------------------------------------------------
Build misskey with the following:

`docker-compose build`

*5.* Init DB
----------------------------------------------------------------
``` shell
docker-compose run --rm web yarn run init
```

*6.* That is it.
----------------------------------------------------------------
Well done! Now you have an environment to run Misskey.

### Launch normally
Just `docker-compose up -d`. GLHF!

### How to update your Misskey server to the latest version
1. `git stash`
2. `git checkout master`
3. `git pull`
4. `git submodule update --init`
5. `git stash pop`
6. `docker-compose build`
7. Check [ChangeLog](../CHANGELOG.md) for migration information
8. `docker-compose stop && docker-compose up -d`

### How to execute [cli commands](manage.en.md):
`docker-compose run --rm web node built/tools/mark-admin @example`

----------------------------------------------------------------

If you have any questions or trouble, feel free to contact us!
