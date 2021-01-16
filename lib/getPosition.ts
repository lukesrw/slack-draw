interface Position {
    xpos: number;
    ypos: number;
}

export function getPosition(
    screen_width: number,
    screen_height: number,
    content_width: number,
    content_height: number
) {
    let position = {
        xpos: screen_width / 2,
        ypos: screen_height / 2
    };

    position.xpos -= content_width / 2;
    position.ypos -= content_height / 2;

    return position;
}
