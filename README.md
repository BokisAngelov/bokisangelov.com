# bokisangelov.com

Personal one-page site of Bokis Angelov. Plain HTML, CSS and a little JavaScript, with no build step, hosted on GitHub Pages.

## Edit
- Text: `index.html`
- Styles: `css/style.css`
- Motion and contact form: `js/main.js`

Push to `main`. GitHub Actions (`.github/workflows/pages.yml`) runs the tests and publishes only if they pass; a failed run leaves the live site as it was. Check runs in the repo Actions tab.

## Test
```
node --test "tests/*.test.mjs"
```
The tests check that the approved copy is present, that banned words are absent, that the page loads no external scripts, and that the form is wired correctly.

## Contact form
[Web3Forms](https://web3forms.com) delivers messages to bokisangelov@gmail.com. The access key in `index.html` is public by design.

## Analytics
GoatCounter (cookie-free, no consent banner needed): https://bokis.goatcounter.com

## Domain
The domain is registered at GoDaddy, but its nameservers are Hostinger's (`dns-parking.com`). Edit DNS in hPanel → Domains → bokisangelov.com → Manage DNS.

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 (4 records) |
| AAAA | @ | 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153 (4 records) |
| CNAME | www | bokisangelov.github.io |

Leave these alone: MX `mx1/mx2.titan.email` and the SPF TXT (email), the ALIAS `old` (the old WordPress site at old.bokisangelov.com), and A `ftp`.

The `CNAME` file in this repo must stay. HTTPS is enforced in GitHub Pages settings.
