# Contribution guide
:v: Thanks for your contributions :v:

[日本語版ガイド](CONTRIBUTING-JA.md)
## When you contribute...
- 任意のIssueについて、せっかく実装してくださっても、実装方法や設計の認識が揃ってないとマージできない/しないことになりかねないので、初めにそのIssue上で着手することを宣言し、必要に応じて他メンバーと実装方法や設計のすり合わせを行ってください。宣言することは作業が他の人と被るのを防止する効果もあります。
  - 設計に迷った時はプロジェクトリーダーの判断を仰いでください。
- 時間や優先度の都合上、提出してくださったPRが長期間放置されることもありますがご理解ください。
  - 温度感高めで見てほしいものは責付いてください。

## Issues
Feature suggestions and bug reports are filed in https://github.com/groundpolis/groundpolis/issues .

* Please search existing issues to avoid duplication. If your issue is already filed, please add your reaction or comment to the existing one.
* If you have multiple independent issues, please submit them separately.

## Branches
* **master** branch is tracking the latest release and used for production purposes.
* **develop** branch is where we work for the next release.

## Internationalization (i18n)
Groundpolis uses the Vue.js plugin [Vue I18n](https://github.com/kazupon/vue-i18n).
Documentation of Vue I18n is available at http://kazupon.github.io/vue-i18n/introduction.html .

## Documentation
* Documents for contributors are located in [`/docs`](/docs).
* Documents for instance admins are located in [`/docs`](/docs).
* Documents for end users are located in [`/src/docs`](/src/docs).

## Test
* Test codes are located in [`/test`](/test).

## Adding Groundpolis Room items
* Use English for material, object and texture names.
* Use meter for unit of length.
* Your PR should include all source files (e.g. `.png`, `.blend`) of your models (for later editing).
* Your PR must include the glTF binary files (`.glb`) of your models.
* Add a locale key `room.furnitures.YOUR_ITEM` at [`/locales/ja-JP.yml`](/locales/ja-JP.yml).
* Add a furniture definition at [`/src/client/app/common/scripts/room/furnitures.json5`](/src/client/app/common/scripts/room/furnitures.json5).

If you have no experience on 3D modeling, we suggest to use the free 3DCG software [Blender](https://www.blender.org/).
You can find information on glTF 2.0 at [glTF 2.0 — Blender Manual]( https://docs.blender.org/manual/en/dev/addons/io_scene_gltf2.html).

## FAQ
### How to resolve conflictions occurred at yarn.lock?

Just execute `yarn` to fix it.

## Glossary
### AP
Stands for _**A**ctivity**P**ub_.

### GPFM
Stands for _**G**round**P**olis **F**lavored **M**FM.

### MFM
Stands for _**M**isskey **F**lavored **M**arkdown_.

### Mk
Stands for _**M**iss**k**ey_.

### SW
Stands for _**S**ervice**W**orker_.

### Nyaize
Convert な(na) to にゃ(nya)

#### Denyaize
Revert Nyaize

## TypeScript Coding Style
### Do not omit semicolons
This is to avoid Automatic Semicolon Insertion (ASI) hazard.

Ref:
* https://www.ecma-international.org/ecma-262/#sec-automatic-semicolon-insertion
* https://github.com/tc39/ecma262/pull/1062

### Do not omit curly brackets
Bad:
``` ts
if (foo)
	bar;
else
	baz;
```

Good:
``` ts
if (foo) {
	bar;
} else {
	baz;
}
```

As a special case, you can omit the curly brackets if

* the body of the `if`-statement have only one statement and,
* the `if`-statement does not have `else`-clause.

Good:
``` ts
if (foo) bar;
```

Make sure that the condition and the body statement are on the same line.

### Do not use `==` when it can simply be replaced with `===`.
🥰

### Use only boolean (or null related) values in the condition of an `if`-statement.
Bad:
``` ts
if (foo.length)
```

Good:
``` ts
if (foo.length > 0)
```

### Do not use `export default`
This is because the current language support does not work well with `export default`.

Ref:
* https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
* https://gfx.hatenablog.com/entry/2017/11/24/135343

Bad:
``` ts
export default function(foo: string): string {
```

Good:
``` ts
export function something(foo: string): string {
```

## Directory structure
```
src ... Source code
	@types ... Type definitions
	prelude ... Independence utils for coding JavaScript without side effects
	misc ... Independence utils for Groundpolis without side effects
	service ... Common functions with side effects
	queue ... Job queues and Jobs
	server ... Web Server
	client ... Client
	mfm ... MFM

test ... Test code

```

## Notes
### placeholder
SQLをクエリビルダで組み立てる際、使用するプレースホルダは重複してはならない
例えば
``` ts
query.andWhere(new Brackets(qb => {
	for (const type of ps.fileType) {
		qb.orWhere(`:type = ANY(note.attachedFileTypes)`, { type: type });
	}
}));
```
と書くと、ループ中で`type`というプレースホルダが複数回使われてしまいおかしくなる
だから次のようにする必要がある
```ts
query.andWhere(new Brackets(qb => {
	for (const type of ps.fileType) {
		const i = ps.fileType.indexOf(type);
		qb.orWhere(`:type${i} = ANY(note.attachedFileTypes)`, { [`type${i}`]: type });
	}
}));
```

### Not `null` in TypeORM
```ts
const foo = await Foos.findOne({
	bar: Not(null)
});
```
のようなクエリ(`bar`が`null`ではない)は期待通りに動作しない。
次のようにします:
```ts
const foo = await Foos.findOne({
	bar: Not(IsNull())
});
```

### `null` in SQL
SQLを発行する際、パラメータが`null`になる可能性のある場合はSQL文を出し分けなければならない
例えば
``` ts
query.where('file.folderId = :folderId', { folderId: ps.folderId });
```
という処理で、`ps.folderId`が`null`だと結果的に`file.folderId = null`のようなクエリが発行されてしまい、これは正しいSQLではないので期待した結果が得られない
だから次のようにする必要がある
``` ts
if (ps.folderId) {
	query.where('file.folderId = :folderId', { folderId: ps.folderId });
} else {
	query.where('file.folderId IS NULL');
}
```

### `[]` in SQL
SQLを発行する際、`IN`のパラメータが`[]`(空の配列)になる可能性のある場合はSQL文を出し分けなければならない
例えば
``` ts
const users = await Users.find({
	id: In(userIds)
});
```
という処理で、`userIds`が`[]`だと結果的に`user.id IN ()`のようなクエリが発行されてしまい、これは正しいSQLではないので期待した結果が得られない
だから次のようにする必要がある
``` ts
const users = userIds.length > 0 ? await Users.find({
	id: In(userIds)
}) : [];
```

### 配列のインデックス in SQL
SQLでは配列のインデックスは**1始まり**。
`[a, b, c]`の `a`にアクセスしたいなら`[0]`ではなく`[1]`と書く

### null IN
nullが含まれる可能性のあるカラムにINするときは、そのままだとおかしくなるのでORなどでnullのハンドリングをしよう。

### `undefined`にご用心
MongoDBの時とは違い、findOneでレコードを取得する時に対象レコードが存在しない場合 **`undefined`** が返ってくるので注意。
MongoDBは`null`で返してきてたので、その感覚で`if (x === null)`とか書くとバグる。代わりに`if (x == null)`と書いてください

### 簡素な`undefined`チェック
データベースからレコードを取得するときに、プログラムの流れ的に(ほぼ)絶対`undefined`にはならない場合でも、`undefined`チェックしないとTypeScriptに怒られます。
でもいちいち複数行を費やして、発生するはずのない`undefined`をチェックするのも面倒なので、`ensure`というユーティリティ関数を用意しています。
例えば、
``` ts
const user = await Users.findOne(userId);
// この時点で user の型は User | undefined
if (user == null) {
	throw 'missing user';
}
// この時点で user の型は User
```
という処理を`ensure`を使うと
``` ts
const user = await Users.findOne(userId).then(ensure);
// この時点で user の型は User
```
という風に書けます。
もちろん`ensure`内部でエラーを握りつぶすようなことはしておらず、万が一`undefined`だった場合はPromiseがRejectされ後続の処理は実行されません。
``` ts
const user = await Users.findOne(userId).then(ensure);
// 万が一 Users.findOne の結果が undefined だったら、ensure でエラーが発生するので
// この行に到達することは無い
// なので、.then(ensure) は
// if (user == null) {
//	throw 'missing user';
// }
// の糖衣構文のような扱いです
```

### How to make Migration Code
```
npx ts-node ./node_modules/typeorm/cli.js migration:generate -n "A name of changes"
```

Please remove unnecessary codes in the generated scripts.

## Other
### don't use a word `follow` in HTML class-name
Adblockers blocks them accidentally...
