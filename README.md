# 『350行でつくるVite⚡』 をやってみる

『[350行でつくるVite⚡](https://trap.jp/post/1549/)』を記事のとおりにやってみる。

記事内のコードのリポジトリ
https://github.com/sapphi-red/micro-vite

Thanks.

## フォルダ

### packages/micro-vite

本体

開発中は、下記のコマンドで自動的にビルドされる。

```bash
pnpm run watch
```

### packages/playground

動作確認環境

```bash
pnpm run dev
```

localhost:3000 で動作確認できる。

本番用ビルド

```bash
pnpm run build
pnpm run preview # ビルド内容の確認
```

## pnpm

```bash
cd packages/micro-vite
pnpm install
```

```bash
cd packages/playground
pnpm install
```

## MEMO

### chokidar が動かない

引数を `'**/*'` ではなく `'.'` にしたところ動作した

[12f2882](https://github.com/monsat/micro-vite-practice/commit/12f288252dd5dd2036a6c4be72d49b1d67da3095)
