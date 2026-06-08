# Hyperion Downloader
Hyperion Downloader is a lightweight multithreaded downloader built with Wails. It currently supports Windows, macOS, and Linux. Mobile support is planned for when Wails finishes mobile support.

## Features
- Multithreaded downloading
- Pause and resume downloads
- Cookies, user agent, referrer, authorization header support

## Known Issues
- Some servers may not support range requests, which is not fully handled yet. Regardless, the downloader would not be able to download any faster from these servers as it would download the same as a browser would.

## Resuming Downloads
If you want to resume a download, add the same URL again and it will resume the download.

## Building from Source
Prerequisites:
- [Git](https://git-scm.com/install/)
- [Go 1.25 or later](https://go.dev/doc/install)
- [Node.js 24 or later](https://nodejs.org/en/download)
- [PNPM](https://pnpm.io/installation)
- [Wails v3](https://v3.wails.io/quick-start/installation/)

1. Clone the repository:
```bash
git clone
cd hyperion-downloader
```
2. Run wails build:
```bash
wails build
```

# License
This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details

# Acknowledgements
- [Wails](https://wails.io/)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Go](https://golang.org/)
- [fastHTTP](https://github.com/valyala/fasthttp)
- [React Router](https://reactrouter.com/) 
- [pretty-bytes](https://github.com/sindresorhus/pretty-bytes)
- [notistack](https://notistack.com/)
- [Vite](https://vite.dev/)

# Donations
If you find this project useful and would like to support its development, you can donate via the following methods:
- [!["Buy Me A Coffee"](https://cdn.buymeacoffee.com/buttons/v2/default-blue.png)](https://buymeacoffee.com/meponder)
- Cryptocurrency:
  - Bitcoin (Mainnet): `bc1qyneg42agd8qv3qnm22w7cnclj8s4s8mtj9crsy`
  - Ethereum-Based: `0x9E21F92BDC48f791B8a4f259c09c9573f22D04cD`
  - Monero: `45PeDfaWjLcDdYQ8SE1jvVJHDU6gwhzQQB6zoMvwsSDTMWaVWZbjKHxdE9rGDNVYd9Wpw4E7MQaqs32DyXMwXc3XL4dywJB`