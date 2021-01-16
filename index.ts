import * as Jimp from "jimp";
import * as robotjs from "robotjs";
import { getPosition } from "./lib/getPosition";

const CONFIG = {
    args: {
        image: 4,
        random: 6,
        resolution_x: 2,
        resolution_y: 3,
        text: 7
    },
    move: {
        arg: 5,
        default: "5"
    },
    text: {
        height: 62,
        width: 128
    },
    threshold: {
        blue: 250,
        green: 250,
        red: 250,
        stop: 6
    }
};

/**
 * @returns {void}
 */
async function draw(
    screen_width: number,
    screen_height: number,
    image: string,
    move: number,
    is_random: boolean,
    text: string
) {
    let mouse = robotjs.getMousePos();
    let positions: number[][] = [];

    robotjs.setMouseDelay(1);
    robotjs.mouseClick();

    try {
        let font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);

        Jimp.read(image, (e, input) => {
            if (e) throw e;

            let position;

            if (text) {
                position = getPosition(
                    screen_width,
                    screen_height,
                    text.length * CONFIG.text.width,
                    CONFIG.text.height
                );

                input.print(font, position.xpos, position.ypos, text);
            }

            position = getPosition(
                screen_width,
                screen_height,
                input.bitmap.width,
                input.bitmap.height
            );
            position.xpos -= screen_width; // offset again by screen width

            for (let ypos = 0; ypos < input.bitmap.height; ypos += move) {
                for (let xpos = 0; xpos < input.bitmap.width; xpos += move) {
                    let pixel = Jimp.intToRGBA(input.getPixelColor(xpos, ypos));

                    if (
                        pixel.a > 0 &&
                        (pixel.r < CONFIG.threshold.red ||
                            pixel.g < CONFIG.threshold.green ||
                            pixel.b < CONFIG.threshold.blue)
                    ) {
                        if (is_random) {
                            positions.push([
                                xpos + position.xpos,
                                ypos + position.ypos
                            ]);
                        } else {
                            robotjs.moveMouse(
                                xpos + position.xpos,
                                ypos + position.ypos
                            );

                            let mouse = robotjs.getMousePos();
                            if (
                                Math.abs(mouse.x - xpos - position.xpos) >
                                CONFIG.threshold.stop
                            ) {
                                console.log(
                                    mouse.x,
                                    xpos,
                                    position.xpos,
                                    mouse.x - xpos - position.xpos
                                );

                                throw new Error("Manually Stopped.");
                            }

                            robotjs.mouseClick();
                        }
                    }
                }
            }

            while (positions.length > 0) {
                let position = positions.splice(
                    Math.floor(Math.random() * positions.length),
                    1
                )[0];

                robotjs.moveMouse(position[0], position[1]);

                let mouse = robotjs.getMousePos();
                if (Math.abs(mouse.x - position[0]) > 2) {
                    throw new Error("Manually Stopped.");
                }

                robotjs.mouseClick();
            }

            robotjs.moveMouse(mouse.x, mouse.y);
            robotjs.mouseClick();
        });
    } catch (e) {
        console.log(e);

        robotjs.moveMouse(mouse.x, mouse.y);
        robotjs.mouseClick();
    }
}

draw(
    parseInt(process.argv[CONFIG.args.resolution_x], 10),
    parseInt(process.argv[CONFIG.args.resolution_y], 10),
    process.argv[CONFIG.args.image],
    parseInt(process.argv[CONFIG.move.arg] || CONFIG.move.default, 10),
    Boolean(parseInt(process.argv[CONFIG.args.random], 10) > 0),
    process.argv[CONFIG.args.text]
);
