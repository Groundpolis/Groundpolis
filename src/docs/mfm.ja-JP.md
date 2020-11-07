# Misskey Flavored Markdown

Misskey Flavored Markdown 記法を使うことで、ノートを装飾できます。この装飾記法は、ユーザープロフィールにも一部使えます。

この記法は Groundpolis ではない Misskey インスタンスでも共通して使えます。

## 基本

`**` で文字を囲むと、 **太字** になります。

例: `**ぽぺ**` _ぽぺ_

`<i>`と`</i>` で文字を囲むと、 _斜体_ になります。

例: `<i>ぽぺ</i>` _ぽぺ_

`~~` で文字を囲むと、 ~~文字を取り消します~~。

例: `~~ぽぺ~~` ~~ぽぺ~~

`<small>`と`</small>` で文字を囲むと、文字が小さく表示されます。

`<center>`と`</center>` で文字を囲むと、文字が中央揃えされます。

`<flip>`と`</flip>`で文字を囲むと、文字が反転します。

## 動き

`***`で文字を囲むと、とても大きく表示されます。

`<motion>`と`</motion>` で文字を囲むと、文字が横に伸びるようなアニメーションを付与できます。
`(((`と`)))`で囲っても同じです。

`<spin>`と`</spin>` で文字を囲むと、文字が回転します。`<spin left>` とすると左回転、 `<spin alternate>` とすると反復します。

`<jump>`と`</jump>` で文字を囲むと、文字がジャンプします。

## コード

<code>```</code> で囲まれた箇所は、ソースコードを記述するための整形された状態で表示されます。改行も可能です。

改行してほしくない場合は ` 単体で似たような状態になります。

## 引用

`>` から始まる行は引用ブロックとして表現されます。

## タイトル

`[]` `【】` などで囲んだ文字列はタイトルとして表示されます。

## リンク系

http https の URL は貼るだけでリンクとして表示されますが、日本語を含むリンクはうまく解析できないことがあります。その場合は URL を `<`と`>`で区切ります。

また、 `[Text](URL)` 記法を使うとリンクを作成できます。Text には表示する文字列、URLには飛んで欲しいURLを指定します。

`?[Text](URL)` のように、先頭に ? をつけると、ノートの下にサマリーが表示されなくなる隠しリンクになります。

## 検索ボックス

`Text 検索` `Text Search` `Text [検索]` `Text [Search]` というように書くと、検索ボックスが現れます。

## 数式

LaTeX 記法に精通しているなら、Groundpolis で数式を思いのままに操ることができます。

`\(` `\)` で LaTeX 記法を囲むことで、数式を表示します。ブロック形式にしたい場合は、代わりに `\[` `\]` で囲みます。

## カスタム絵文字

`:shortcode:` という記法で、カスタム絵文字を使用できます。どのようなカスタム絵文字があるかはインスタンスによって異なりますが、ノート作成フォームにて `:` を打ち込むと候補が出現する他、絵文字ピッカーからも選択できるのでぜひ使ってみてください。

## メンション

`@username` という記法で、特定のユーザーのことを言及できます。Twitter等の他のウェブサービスにおけるそれと同等で相手側に通知が届くようになっているので、メッセージを送信する目的でも使用できます。

また、 `@user@example.com` といった記法で、リモートユーザーを対象にすることができます。試しに `@test@groundpolis.app` と送ってみてください。

## ハッシュタグ

`#hogehoge` という記法で、ハッシュタグを作成できます。Twitter等の他のウェブサービスにおけるそれと同等で、同じハッシュタグのついたノートを検索しやすくなります。

また、ハッシュタグはユーザーの自己紹介にも付けることができ、共通の趣味を持つユーザーを見つけやすくなります。

## Groundpolis Flavored MFM

Groundpolis は MFM 記法をいくつか拡張します。これは通称 GPFM と呼ばれますが、他の Misskey インスタンスでは正しく表示できない可能性があるため、ご注意ください。

### 基本

`<right>`と`</right>` で文字を囲むと、文字が右揃えされます。

`<sup>`と`</sup>` で文字を囲むと、上付き文字になります。

`<sub>`と`</sub>` で文字を囲むと、下付き文字になります。

### 動き

`****`で文字を囲むと、もっともっと大きく表示されます。

`<vflip>`と`</vflip>`で文字を囲むと、文字が縦に反転します。

`<xspin>`と`</xspin>`、`<yspin>`と`</yspin>`はそれぞれX軸方向、Y軸方向に文字を回転します。 `<spin>` と同じく、 `alternate` `left` を指定できます。

`<blink>`と`</blink>`で文字を囲むと、文字が点滅します。

`<marquee>`と`</marquee>`で文字を囲むと、文字が右から左に流れます。

### アバター絵文字

`:@dev@groundpolis.app:` のように `:` でメンションを囲うことで、ユーザーのアバターを絵文字として利用できます。

アバター絵文字を使用しても、相手に通知が届くことはありません。

なお、アバター絵文字は技術的制約により、プレビューに表示されません。