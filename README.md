# MMM-whoshome

**MMM-whoshome** is a module for [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) to display who is home.

This module tracks who is at home by detecting the presence of personal cellular phones on the local network. It can also be used with laptops, cars (e.g., Teslas), or any other Wi-Fi-enabled devices.

**Note:** Most phones use randomized MAC addresses. For accurate tracking, ensure your phone uses its real MAC address on your home network.

## Screenshot

It looks like this: (Not at home persons are in greyscale)

![Screenshot of whoshome](whoshome.png)

## Prerequisites

Before installing, make sure you have `nmap` installed on your Linux (Raspberry Pi) server.

### Install `nmap`

```bash
sudo apt -y install nmap
```

## Installation

1. Navigate to the MagicMirror modules directory:

    ```bash
    cd ~/MagicMirror/modules
    ```

2. Clone the repository:

    ```bash
    git clone https://github.com/yedidiaklein/MMM-whoshome
    ```

## Update

Just enter the MMM-whoshome directory and pull the update:

```bash
cd ~/MagicMirror/modules/MMM-whoshome
git pull
```

## Configuration

Add the following configuration to your `config.js` file:

```javascript
{
    module: "MMM-whoshome",
    position: "top_right",
    config: {
        "TRACK": {
            "John": {
                "mac": "12:34:56:78:90:12",
                "image": "config/people/John.png"
            },
            "Ploni": {
                "mac": "90:80:70:60:50:40",
                "image": "config/people/ploni.jpg"
            }
        }
    }
},
```

### Image Configuration

You can specify the path to user images either as URLs or as local files within the `config/people` directory. (Create people under config directory, and copy to there your images.)

## Advanced Configuration

- **Network Identification:** The script `mapmacs.sh` may not work perfectly with non-standard networks (i.e., not a /24 subnet). Adjust the `network` line manually if necessary.
- **Presence Detection:** The script `macping.sh` assumes a person is no longer present if he haven’t been detected for 5 minutes. You can adjust this duration, as phones might go to sleep and temporarily disappear even if the person is at home.

## Style and UI

You can change colors, font size, font family, padding, borders, and other UI effects by copying the contents of `whoshome.css` to your `custom.css` and customizing it there.

## Suggestions

Any suggestions for improvements or feedback are welcome!

**Author:** Yedidia Klein
