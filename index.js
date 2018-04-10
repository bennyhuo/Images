#!/usr/local/bin/node

const fs = require("fs");
const imageSize = require('image-size');
const sharp = require("sharp");

sharp.cache(false)

let path = ".";
if (process.argv.length > 2) {
    path = process.argv[2];
}
let maxWidth = 500;
if (process.argv.length > 3) {
    maxWidth = parseInt(process.argv[3]);
}

let override = process.argv[4] !== 'false';

String.prototype.rsplit = function (delimiter, limit) {
    delimiter = this.split(delimiter || /s+/);
    return limit ? delimiter.splice(-limit) : delimiter;
};

console.log(path + ", =>" + maxWidth);
if (fs.statSync(path).isDirectory()) {
    process.chdir(path);
    fs.readdir(".", function (err, items) {
        items.forEach(processImage)
    });
} else {
    processImage(path)
}


function processImage(item) {
    if(item.toLowerCase().endsWith("jpg") || item.toLowerCase().endsWith("png")){

        const dimensions = imageSize(item);
        console.log("original size: " + dimensions.width + ", " + dimensions.height);
        if (dimensions.width > maxWidth) {
            const original = sharp(item);
            original.resize(maxWidth)
                .toBuffer()
                .then(buf => {
                        let output;
                        if (override) {
                            output = item;
                        } else {
                            const splits = item.rsplit(".", 2);
                            output = splits[0] + "_" + maxWidth + "." + splits[1];

                        }

                        fs.writeFile(output, buf,
                            err => {
                                if (err) console.log(err)
                            })

                    },
                    err => console.log(err)
                )
                .catch(err => console.error(err))
        } else {
            console.log("Skip: " + item)
        }
    } else {
        console.log("File not supported: " + item)
    }
}