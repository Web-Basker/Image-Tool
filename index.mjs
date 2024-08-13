import { Command } from "commander";
import { existsSync, readdirSync } from 'node:fs';
import sharp from "sharp";

const program = new Command();
const __dirname = process.cwd();

program
    .description("A tool to automate my workflow of rezising, converting and optimizing images using sharp.")
    .requiredOption('-m, --mobile-width <string>', 'Size on mobile screen')
    .requiredOption('-d, --desktop-width <string>', 'Size on desktop screen');

program.parse(process.argv);

async function main() {
    if (!existsSync(__dirname)) { 
        console.log('Directory does not exist');
        process.exit(1); 
    }
    
    const images = getImagesFromDirectory();

    if (images.length === 0) {
        console.log('No images found in the directory');
        process.exit(1);
    }
    
    const options = program.opts();
    
    for (const image of images) {
        await optimizeImage(image, options.mobileWidth, "-m");
        await optimizeImage(image, options.desktopWidth, "");
    }
}

function getImagesFromDirectory() {
    return readdirSync(__dirname).filter(file => file.includes('.jpg'));
}

async function optimizeImage(image, width, prefix) {
    try {
        await sharp(image)
            .resize(extractSize(width))
            .toFormat('webp', { quality: 70 })
            .toFile(formatName(image, prefix));
        console.log(`Optimized ${image} to ${prefix}`);
    } catch (error) {
        console.error(`Error processing ${image}:`, error);
    }
}

function extractSize(width) {
    const parsedWidth = parseInt(width);
    return {
        width: parsedWidth * 2,
        fit: 'inside',
    };
}

function formatName(imageName, prefix) {
    const nameParts = imageName.split('.');
    return `${nameParts[0]}${prefix}.webp`;
}

main();