import { COLORS } from "./colors";

const Block = function (pos, size, color) {
  this.pos = pos;
  // size of each dimension (obj with attrs x,y,z)
  this.size = size;

  // XS of 3 color shades (light,medium,dark)
  this.color = color || COLORS.red;
};

Block.prototype = {
  getBounds: function () {
    var p = this.pos;
    var s = this.size;
    return {
      xmin: p.x,
      xmax: p.x + s.x,
      ymin: p.y,
      ymax: p.y + s.y,
      zmin: p.z,
      zmax: p.z + s.z
    };
  }
};

Block.colors = COLORS;

export { Block };
