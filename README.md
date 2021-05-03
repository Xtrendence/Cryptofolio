# ![Image](https://i.imgur.com/2qM4d4k.png)

### What is Cryptofolio?

Cryptofolio is an open-source, and self-hosted solution for tracking your cryptocurrency holdings. It features a web interface, an Android mobile app, and a cross-platform desktop application for Windows, macOS, and Linux. These three platforms all work using a RESTful API, which you'd have to host yourself.

### How can I view a list of upcoming features?

The [project board](https://github.com/Xtrendence/Cryptofolio/projects/1?fullscreen=true) will be updated with any features that are currently in development.

### What's the tech stack?

The web interface is just HTML/CSS with vanilla JS, the mobile app was made with React Native, the desktop app is essentially a clone of the website and uses Electron. The RESTful API was coded in PHP.

### Can I import my wallets or transact?

No. Cryptofolio is solely able to keep track of the value of any cryptoassets you manually add. It does not communicate or integrate with any blockchain.

### What can it do?

It can provide you with a quick glance at the market, while also keeping track of your assets and their value. It also includes a feature that allows you to share your portfolio in a read-only way with anyone you choose to give the link to. In order to set this up, please go into the "Settings" section of the web interface, enable portfolio sharing, set a PIN code, and use the generated URL to view your assets without having to login. This allows you to share your portfolio with friends, family, or strangers without them being able to modify it.

### Is it secure?

Since no private keys or actual funds are held on Cryptofolio, your assets aren't at risk in any way. User passwords are hashed with bcrypt, and there are client-side validation checks when performing actions that modify any data. However, since this is a self-hosted application that's only intended to be used by one person, there aren't that many validation checks on the server-side, so if you tried to break it on purpose, you'd probably succeed. The idea here is that you wouldn't try to mess up your own data. In any case, if you do break things, deleting "account.json", "holdings.json", and "settings.json" in the "/api/data/" directory, and subsequently logging in again would generate a fresh working copy of the files (though you'd lose your data).

### How do I set it up? 

**Initial Password**: admin

First, download the latest release from the [Releases](https://github.com/Xtrendence/Cryptofolio/releases) section. For the API and website, to ensure you don't get any unfinished code and that everything is compatible, download the "Source code (zip)" file from the Releases section rather than just downloading the source code containing the most recent commits. You'll then have to set up a server on your network using a guide such as [this](https://www.ionos.co.uk/digitalguide/server/tools/xampp-tutorial-create-your-own-local-test-server/) one.

*If you'd rather host it online, you can use a service such as [this](https://www.000webhost.com/free-php-hosting) one in order to get free PHP hosting. Your holdings and such are stored in plaintext, so keep in mind that the hosting provider would be able to see your data. This option is a lot easier though, you'd essentially just have to upload the "api" and "website" folders with whatever storage interface the hosting service provides, and you'd be done.*

Once you've set up a server, extract the content of the ZIP archive you downloaded from the Releases section, and copy-paste the "api" folder to wherever your server's DocumentRoot directory is (usually C:/xampp/htdocs/), and take note of the URL pointing to the "/api/" directory (you'll need to know your server's local IP for this). For example, if you're hosting it on your own network, the URL would look something like:

http://192.168.1.58:8080/api/

Or on port 80:

http://192.168.1.58/api/

If everything is working correctly, opening that URL with a browser should output the following:

```{ "status": "online" }```

You can then copy the "website" folder into the DocumentRoot directory as well. Install the APK file on your Android phone, launch the app, and enter the URL you took note of earlier, and enter "admin" as your password (you can and should change this in the "Settings" page after you first log in).

### What is the Coin ID when adding an asset?

#### V.2.0+

You no longer need to use the CoinGecko ID of a cryptoasset to add it to your holdings. They can be added using the appropriate symbol/ticker (such as BTC for Bitcoin, ADA for Cardano, ETH for Ethereum, DOT for Polkadot and so on).

#### Older Versions

In order to add an asset to your list of holdings, you will need to find out what its ID is on CoinGecko. You can find this by looking at the URL of whatever asset you're looking at. So, for example, the Moon token of r/CryptoCurrency can be found [here](https://www.coingecko.com/en/coins/moon), and as seen in the URL, its ID is simply "moon". This process might be made easier in the future if the demand is there, and I might add some form of search functionality, but this wouldn't really be possible with CoinGecko's current API.

### Please keep the following points in mind:

- Since the CoinGecko API is used to fetch and utilize market data (such as the price of a cryptocurrency), your IP will most likely be logged by CoinGecko as you'd be making requests to their servers.
- Coin rankings and data might differ from other websites such as CoinMarketCap. Any inaccuracy would be due to CoinGecko's data being wrong or otherwise different.
- Your PIN code for sharing your portfolio is stored in plaintext.
- CoinGecko's API is limited in terms of both functionality, and how often requests can be made. As such, be careful not to refresh **too** often. Any rate limits are temporary though, you won't get banned or anything permanently.

#### Mobile App
![Screenshot](https://i.imgur.com/cTYZdwT.png)
![Screenshot](https://i.imgur.com/J7uQBu4.png)
![Screenshot](https://i.imgur.com/lvFoLdy.png)
![Screenshot](https://i.imgur.com/qddyV5R.png)
![Screenshot](https://i.imgur.com/WiZ22jv.png)
![Screenshot](https://i.imgur.com/OFO9zG6.png)
#### Desktop App
![Screenshot](https://i.imgur.com/Jd2wig5.png)
![Screenshot](https://i.imgur.com/ZgvHwYn.png)
![Screenshot](https://i.imgur.com/LHcPpKL.png)
![Screenshot](https://i.imgur.com/EyuWB04.png)
![Screenshot](https://i.imgur.com/83cADwf.png)
![Screenshot](https://i.imgur.com/H33R72y.png)
![Screenshot](https://i.imgur.com/6rRf74x.png)
![Screenshot](https://i.imgur.com/PI8X2Fs.png)
![Screenshot](https://i.imgur.com/SKIoiJA.png)
![Screenshot](https://i.imgur.com/tZXm6Fd.png)
![Screenshot](https://i.imgur.com/9ySaXkM.png)
![Screenshot](https://i.imgur.com/a6eQVWF.png)
![Screenshot](https://i.imgur.com/SP8NfDV.png)
![Screenshot](https://i.imgur.com/udPlM1D.png)
#### Website
![Screenshot](https://i.imgur.com/vunbAIz.png)
![Screenshot](https://i.imgur.com/3JbN8Gt.png)
![Screenshot](https://i.imgur.com/aZdlJ3X.png)
![Screenshot](https://i.imgur.com/tWpbWCP.png)
![Screenshot](https://i.imgur.com/fLAvYmZ.png)
![Screenshot](https://i.imgur.com/wMrUWpy.png)
![Screenshot](https://i.imgur.com/KI2tgVi.png)
![Screenshot](https://i.imgur.com/bSWI2wk.png)
![Screenshot](https://i.imgur.com/ojVRJod.png)
![Screenshot](https://i.imgur.com/7pxv2AG.png)
![Screenshot](https://i.imgur.com/WXwarTn.png)
![Screenshot](https://i.imgur.com/54nMKbM.png)