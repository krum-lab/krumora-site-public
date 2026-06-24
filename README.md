# krumora-site

Landing page da **Krumora** — *A IA que vende enquanto você dorme.*

Site estático (HTML/CSS/JS puro, sem build) hospedado no **GitHub Pages** em `krumora.com.br`.

## Estrutura
- `index.html` — landing completa (estilos e scripts inline, self-contained)
- `404.html` — página de erro
- `CNAME` — domínio custom (`krumora.com.br`)
- `.nojekyll` — desativa o Jekyll do GitHub Pages

## ⚠️ Antes de publicar
No `index.html`, no bloco `<script>` no fim, troque a constante:
```js
var WHATSAPP_NUMBER = '5500000000000';   // <<< número real, formato internacional, só dígitos
```

## Publicar (GitHub Pages)
1. Criar repo `krumora-site` no GitHub e dar push deste diretório.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / root.**
3. Em **Custom domain**, confirmar `krumora.com.br` (o arquivo `CNAME` já cuida disso).
4. No **Registro.br**, apontar o DNS para o GitHub Pages:
   - `A` `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` `www` → `<seu-usuario>.github.io`
5. Marcar **Enforce HTTPS** quando o certificado provisionar.

> Lição aprendida: a landing anterior só existia no Netlify e foi perdida quando o painel
> ficou bloqueado. Agora a fonte vive aqui, versionada no GitHub desde o commit 1.
