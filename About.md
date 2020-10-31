
# このフォークについて

[Misskey v12](https://github.com/syuilo/misskey)のフォーク

基本的に、環境/依存関係/パフォーマンス周りの修正とかのみで、DBスキーマとかUIをいじる変更は入れないはず。  
また、基本的に本家を追従するはず。

## 主な変更点

### ビルドを軽く

https://github.com/mei23/misskey-v12/pull/760

大抵の環境でビルドが速くなって、メモリ512MBでもそこそこの時間でビルドできるようになってるはず。

```
NODE_OPTIONS="--max-old-space-size=2048" NODE_ENV=production yarn build
```
でビルドすればメモリ512MBでもそこそこの時間でビルドできるはず。

### arm64上でのDockerに対応

https://github.com/mei23/misskey-v12/pull/786

arm64上でのDockerに対応しているはず

### 注意

sharpがどうのこうのと言われて起動できない場合は
```
rm -rf node_moduls/sharp
yarn --force
```
を行った後ビルド
