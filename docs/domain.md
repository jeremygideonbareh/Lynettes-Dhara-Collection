# Connect lynettedharacollection.com at Hostinger

The demo uses the GitHub Pages project address until the owner connects the custom domain. The publishing account is `jeremygideonbareh`.

1. In GitHub, open the account’s Pages settings and start domain verification. If GitHub provides a TXT record, copy its exact name and generated value to the Hostinger DNS zone, then verify. The challenge value is generated for the account.
2. In the repository’s Settings → Pages, enter `lynettedharacollection.com` as the custom domain and save.
3. In the authoritative DNS zone for the domain, replace conflicting parking or redirect entries at `@` and `www` with the records below. Use Hostinger’s default TTL. Preserve email and other unrelated records.

| Type | Host | Target |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | jeremygideonbareh.github.io |

4. Wait for GitHub’s DNS check and certificate issuance, enable **Enforce HTTPS**, and test the apex and www addresses on a phone. If Hostinger does not host the authoritative nameservers, enter the records at the provider that does.

Source: [GitHub Pages custom domain configuration](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

