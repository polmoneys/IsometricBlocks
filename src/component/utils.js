import { useEffect, useState, useRef } from "react";
import { useIsSSR } from "@react-aria/ssr";
import { hexToRgb } from "./colors";


function useResizeObserver(targetRef) {
  const [contentRect, setContentRect] = useState({});
  const resizeObserver = useRef(null);

  useEffect(() => {
    observe(ResizeObserver);

    function observe(ResizeObserver) {
      resizeObserver.current = new ResizeObserver((entries) => {
        const {
          width,
          height,
          top,
          right,
          bottom,
          left
        } = entries[0].contentRect;
        setContentRect({ width, height, top, right, bottom, left });
      });
      if (targetRef.current) {
        resizeObserver.current.observe(targetRef.current);
      }
    }

    return disconnect;
  }, [targetRef]);

  function disconnect() {
    if (resizeObserver.current) {
      resizeObserver.current.disconnect();
    }
  }
  const isSSR = useIsSSR();
  return isSSR ? false : contentRect;
}

export { useResizeObserver };

function drawScene(
  sortedBlocks,
  shouldDrawPlane,
  camera,
  painter,
  ctx,
  silhouette
) {
  var i, len;
  for (i = 0, len = sortedBlocks.length; i < len; i++) {
    // only draw a separation plane for the last block
    // and only if there is a block behind it.
    if (shouldDrawPlane && i > 0 && i === len - 1) {
      drawSeparationPlane(
        sortedBlocks[i],
        sortedBlocks[i - 1],
        camera.current,
        painter.current,
        ctx.current
      );
    }

    drawBlock(
      sortedBlocks[i],
      silhouette,
      ctx.current,
      painter.current,
      camera.current
    );
  }
}
function drawGrid(painter, ctx) {
  let x, y;

  // grid step
  var step = 1;

  // grid range
  var maxx = 15;
  var maxy = 15;

  // plot x lines
  ctx.beginPath();
  for (x = -maxx; x <= maxx; x += step) {
    painter.moveTo(ctx, { x: x, y: -maxy });
    painter.lineTo(ctx, { x: x, y: maxy });
  }

  // plot y lines
  for (y = -maxy; y <= maxy; y += step) {
    painter.moveTo(ctx, { x: -maxx, y: y });
    painter.lineTo(ctx, { x: maxx, y: y });
  }

  // draw grid lines
  ctx.strokeStyle = "#d7d7d7";
  ctx.lineWidth = 1;
  ctx.stroke();
}

const drawSilhouette = (color, ctx, painter, b) => {
  var rgb = hexToRgb(color.medium);
  var tcolor = "rgba(" + rgb + ",0.7)";
  ctx.beginPath();
  painter.moveTo(ctx, b.frontDown);
  painter.lineTo(ctx, b.leftDown);
  painter.lineTo(ctx, b.leftUp);
  painter.lineTo(ctx, b.backUp);
  painter.lineTo(ctx, b.rightUp);
  painter.lineTo(ctx, b.rightDown);
  ctx.fillStyle = tcolor;
  ctx.fill();
};

// draw a plane to separate two isometric blocks.
function drawSeparationPlane(frontBlock, backBlock, camera, painter, ctx) {
  // exit if back plane is not present
  if (!backBlock) {
    return;
  }

  var bounds = frontBlock.getBounds();

  // get axis of separation
  var aAxis = camera.getSpaceSepAxis(frontBlock, backBlock);
  var bAxis, cAxis;

  let a;
  // aAxis, bAxis, cAxis are either 'x', 'y', or 'z'
  // a, b, c are the values of its respective axis.

  // determine what our abstract axes correspond to.
  if (aAxis === "x") {
    a = bounds.xmax;
    bAxis = "y";
    cAxis = "z";
  } else if (aAxis === "y") {
    a = bounds.ymax;
    bAxis = "x";
    cAxis = "z";
  } else if (aAxis === "z") {
    a = bounds.zmin;
    bAxis = "x";
    cAxis = "y";
  }

  // the radius (read margin) of the separation plane).
  var r = 0.7;

  // the points of the separation plane in abstract coords.
  var pts = [
    { a: a, b: bounds[bAxis + "min"] - r, c: bounds[cAxis + "min"] - r },
    { a: a, b: bounds[bAxis + "min"] - r, c: bounds[cAxis + "max"] + r },
    { a: a, b: bounds[bAxis + "max"] + r, c: bounds[cAxis + "max"] + r },
    { a: a, b: bounds[bAxis + "max"] + r, c: bounds[cAxis + "min"] - r }
  ];

  // convert abstract coords to the real coords for this block.
  var i;
  var finalPts = [];
  for (i = 0; i < 4; i++) {
    var p = {};
    p[aAxis] = pts[i].a;
    p[bAxis] = pts[i].b;
    p[cAxis] = pts[i].c;
    finalPts.push(p);
  }

  // draw separation plane.
  painter.fillQuad(
    ctx,
    finalPts[0],
    finalPts[1],
    finalPts[2],
    finalPts[3],
    "rgba(0,0,0,0.35)"
  );
  painter.strokeQuad(
    ctx,
    finalPts[0],
    finalPts[1],
    finalPts[2],
    finalPts[3],
    "rgba(0,0,0,0.9)",
    1
  );
}

function drawBlock(block, silhouette, ctx, painter, camera) {
  const color = block.color;

  // get aliases for each of the block's vertices relative to camera's perspective.
  const b = camera.getIsoNamedSpaceVerts(block);

  if (silhouette) {
    drawSilhouette(color, ctx, painter, b);
  } else {
    // fill in the grout for the inside edges
    var lineWidth = 1;
    const groupColor = color.medium;
    painter.line(ctx, b.leftUp, b.frontUp, groupColor, lineWidth);
    painter.line(ctx, b.rightUp, b.frontUp, groupColor, lineWidth);
    painter.line(ctx, b.frontDown, b.frontUp, groupColor, lineWidth);

    // Do not add line width when filling faces.
    // This prevents a perimeter padding around the hexagon.
    // Nonzero line width could cause the perimeter of another box
    // to bleed over the edge of a box in front of it.
    lineWidth = 0;

    // fill each visible face of the block.

    // left face
    painter.fillQuad(
      ctx,
      b.frontDown,
      b.leftDown,
      b.leftUp,
      b.frontUp,
      !silhouette ? color.dark : color.medium,
      lineWidth
    );

    // top face
    painter.fillQuad(
      ctx,
      b.frontUp,
      b.leftUp,
      b.backUp,
      b.rightUp,
      !silhouette ? color.light : color.medium,
      lineWidth
    );

    // right face
    painter.fillQuad(
      ctx,
      b.frontDown,
      b.frontUp,
      b.rightUp,
      b.rightDown,
      color.medium,
      lineWidth
    );
  }
}

// From kennebec at http://stackoverflow.com/a/3955096/142317
// Add a remove value function to the Array class.
Array.prototype.remove = function () {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

export { drawScene, drawBlock, drawSeparationPlane, drawSilhouette, drawGrid };

// Sort blocks in the order that they should be drawn for the given camera.
const sortBlocks = function (blocks, camera) {
  var i,
    j,
    numBlocks = blocks.length;

  // Initialize the list of blocks that each block is behind.
  for (i = 0; i < numBlocks; i++) {
    blocks[i].blocksBehind = [];
    blocks[i].blocksInFront = [];
  }

  // For each pair of blocks, determine which is in front and behind.
  var a, b, frontBlock;
  for (i = 0; i < numBlocks; i++) {
    a = blocks[i];
    for (j = i + 1; j < numBlocks; j++) {
      b = blocks[j];
      frontBlock = camera.getFrontBlock(a, b);
      if (frontBlock) {
        if (a === frontBlock) {
          a.blocksBehind.push(b);
          b.blocksInFront.push(a);
        } else {
          b.blocksBehind.push(a);
          a.blocksInFront.push(b);
        }
      }
    }
  }

  // Get list of blocks we can safely draw right now.
  // These are the blocks with nothing behind them.
  var blocksToDraw = [];
  for (i = 0; i < numBlocks; i++) {
    if (blocks[i].blocksBehind.length === 0) {
      blocksToDraw.push(blocks[i]);
    }
  }

  // While there are still blocks we can draw...
  var blocksDrawn = [];
  while (blocksToDraw.length > 0) {
    // Draw block by removing one from "to draw" and adding
    // it to the end of our "drawn" list.
    var block = blocksToDraw.pop();
    blocksDrawn.push(block);

    // Tell blocks in front of the one we just drew
    // that they can stop waiting on it.
    for (j = 0; j < block.blocksInFront.length; j++) {
      var frontBlock = block.blocksInFront[j];

      // Add this front block to our "to draw" list if there's
      // nothing else behind it waiting to be drawn.
      frontBlock.blocksBehind.remove(block);
      if (frontBlock.blocksBehind.length === 0) {
        blocksToDraw.push(frontBlock);
      }
    }
  }

  return blocksDrawn;
};

export { sortBlocks };

