import { Camera } from "./camera";
import { Painter } from "./painter";
import { Block } from "./block";
import { sortBlocks, useResizeObserver, drawScene, drawGrid } from "./utils";
import React, { useEffect, useRef } from "react";

const Scene = function (props) {
  const {
    debug = false,
    plane: shouldDrawPlane,
    silhouette,
    of,
    origin,
    scale = undefined
  } = props;

  const blocks = useRef();
  const canvas = useRef();
  const ctx = useRef();
  const camera = useRef();
  const painter = useRef();

  const { width, height } = useResizeObserver(canvas);

  useEffect(() => {
    if (!width || width === 0) return;

    const dpi = window.devicePixelRatio || 1;

    ctx.current = canvas.current.getContext("2d");

    blocks.current = of.map(
      (block) => new Block(block.pos, block.size, block.color)
    );

    canvas.current.setAttribute("width", width);
    canvas.current.setAttribute("height", height);

    const finalScale = scale
      ? scale(width * dpi, height * dpi)
      : (height * dpi) / 8;

    const finalOrigin = (origin && origin(width * dpi, height * dpi)) || {
      x: (width * dpi) / 2,
      y: height * dpi
    };

    camera.current = new Camera(finalOrigin, finalScale);
    painter.current = new Painter(camera.current);

    if (debug) {
      drawGrid(painter.current, ctx.current);
    }

    let sortedBlocks = blocks.current;
    const shouldSortBlocks = sortBlocks === undefined ? true : sortBlocks;
    if (shouldSortBlocks) {
      sortedBlocks = sortBlocks(blocks.current, camera.current);
    }

    drawScene(sortedBlocks, shouldDrawPlane, camera, painter, ctx, silhouette);
  }, [silhouette, shouldDrawPlane, debug, of, origin, scale, width, height]);

  return <canvas ref={canvas} />;
};

export { Scene };
