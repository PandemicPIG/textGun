function loadGold(_w,_h){
    
    w= _w;
    h=_h;
    
    
 /**   
The MIT License (MIT)

Copyright (c) 2014 Maksim Surguy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

**/


// Sensitivity
  // Sensitivity - do not remove
horisontal_sensitivity = 6;
verical_sensitivity = 5;
    
    pHorizontal_sensitivity = 15;
	pVertical_sensitivity = 3;
    lHorizontal_sensitivity = 18;
	lVertical_sensitivity = 3;

  // Mesh Properties
global_MESH = {
    width: 1,
    height: 1,
    slices: 50,
    /* set 1
    ambient: '#DBB724',
    diffuse: '#FFFFFF'
    */
    ambient: '#EAD754',
    diffuse: '#EFE7AD'
  
};

  // Light Properties
global_LIGHT = {
    count: 1,
    xPos : 0,
    yPos : 0,
    // currently live, swap to .js file value after update
    zOffset: 14,
    
    /* set 1
    ambient: '#C3CFB9',
    diffuse: '#FFEF25',
    */


    //ambient: '#EFDE64',
    ambient: '#DBCD03',
    diffuse: '#EFE99D',
    pickedup :true,
    proxy : false,
    currIndex : 0
};
    
var Delaunay;
/**
 * Defines the Flat Surface Shader namespace for all the awesomeness to exist upon.
 * @author Matthew Wagerfield
 */
FSS = {
  FRONT  : 0,
  BACK   : 1,
  DOUBLE : 2,
  SVGNS  : 'http://www.w3.org/2000/svg'
};

/**
 * @class Array
 * @author Matthew Wagerfield
 */
FSS.Array = typeof Float32Array === 'function' ? Float32Array : Array;

/**
 * @class Utils
 * @author Matthew Wagerfield
 */
FSS.Utils = {
  isNumber: function(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }
};

/**
 * Request Animation Frame Polyfill.
 * @author Paul Irish
 * @see https://gist.github.com/paulirish/1579671
 */
(function() {

  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
    //console.log('RequestAnimationFrame');

  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame  = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currentTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currentTime - lastTime));
      var id = window.setTimeout(function() {
        callback(currentTime + timeToCall);
      }, timeToCall);
      lastTime = currentTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }

}());

/**
 * @object Math Augmentation
 * @author Matthew Wagerfield
 */
Math.PIM2 = Math.PI*2;
Math.PID2 = Math.PI/2;
Math.randomInRange = function(min, max) {
  return min + (max - min) * Math.random();
};
Math.clamp = function(value, min, max) {
  value = Math.max(value, min);
  value = Math.min(value, max);
  return value;
};

/**
 * @object Vector3
 * @author Matthew Wagerfield
 */
FSS.Vector3 = {
  create: function(x, y, z) {
    var vector = new FSS.Array(3);
    this.set(vector, x, y, z);
    return vector;
  },
  clone: function(a) {
    var vector = this.create();
    this.copy(vector, a);
    return vector;
  },
  set: function(target, x, y, z) {
    target[0] = x || 0;
    target[1] = y || 0;
    target[2] = z || 0;
    return this;
  },
  setX: function(target, x) {
    target[0] = x || 0;
    return this;
  },
  setY: function(target, y) {
    target[1] = y || 0;
    return this;
  },
  setZ: function(target, z) {
    target[2] = z || 0;
    return this;
  },
  copy: function(target, a) {
    target[0] = a[0];
    target[1] = a[1];
    target[2] = a[2];
    return this;
  },
  add: function(target, a) {
    target[0] += a[0];
    target[1] += a[1];
    target[2] += a[2];
    return this;
  },
  addVectors: function(target, a, b) {
    target[0] = a[0] + b[0];
    target[1] = a[1] + b[1];
    target[2] = a[2] + b[2];
    return this;
  },
  addScalar: function(target, s) {
    target[0] += s;
    target[1] += s;
    target[2] += s;
    return this;
  },
  subtract: function(target, a) {
    target[0] -= a[0];
    target[1] -= a[1];
    target[2] -= a[2];
    return this;
  },
  subtractVectors: function(target, a, b) {
    target[0] = a[0] - b[0];
    target[1] = a[1] - b[1];
    target[2] = a[2] - b[2];
    return this;
  },
  subtractScalar: function(target, s) {
    target[0] -= s;
    target[1] -= s;
    target[2] -= s;
    return this;
  },
  multiply: function(target, a) {
    target[0] *= a[0];
    target[1] *= a[1];
    target[2] *= a[2];
    return this;
  },
  multiplyVectors: function(target, a, b) {
    target[0] = a[0] * b[0];
    target[1] = a[1] * b[1];
    target[2] = a[2] * b[2];
    return this;
  },
  multiplyScalar: function(target, s) {
    target[0] *= s;
    target[1] *= s;
    target[2] *= s;
    return this;
  },
  divide: function(target, a) {
    target[0] /= a[0];
    target[1] /= a[1];
    target[2] /= a[2];
    return this;
  },
  divideVectors: function(target, a, b) {
    target[0] = a[0] / b[0];
    target[1] = a[1] / b[1];
    target[2] = a[2] / b[2];
    return this;
  },
  divideScalar: function(target, s) {
    if (s !== 0) {
      target[0] /= s;
      target[1] /= s;
      target[2] /= s;
    } else {
      target[0] = 0;
      target[1] = 0;
      target[2] = 0;
    }
    return this;
  },
  cross: function(target, a) {
    var x = target[0];
    var y = target[1];
    var z = target[2];
    target[0] = y*a[2] - z*a[1];
    target[1] = z*a[0] - x*a[2];
    target[2] = x*a[1] - y*a[0];
    return this;
  },
  crossVectors: function(target, a, b) {
    target[0] = a[1]*b[2] - a[2]*b[1];
    target[1] = a[2]*b[0] - a[0]*b[2];
    target[2] = a[0]*b[1] - a[1]*b[0];
    return this;
  },
  min: function(target, value) {
    if (target[0] < value) { target[0] = value; }
    if (target[1] < value) { target[1] = value; }
    if (target[2] < value) { target[2] = value; }
    return this;
  },
  max: function(target, value) {
    if (target[0] > value) { target[0] = value; }
    if (target[1] > value) { target[1] = value; }
    if (target[2] > value) { target[2] = value; }
    return this;
  },
  clamp: function(target, min, max) {
    this.min(target, min);
    this.max(target, max);
    return this;
  },
  limit: function(target, min, max) {
    var length = this.length(target);
    if (min !== null && length < min) {
      this.setLength(target, min);
    } else if (max !== null && length > max) {
      this.setLength(target, max);
    }
    return this;
  },
  dot: function(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  },
  normalise: function(target) {
    return this.divideScalar(target, this.length(target));
  },
  negate: function(target) {
    return this.multiplyScalar(target, -1);
  },
  distanceSquared: function(a, b) {
    var dx = a[0] - b[0];
    var dy = a[1] - b[1];
    var dz = a[2] - b[2];
    return dx*dx + dy*dy + dz*dz;
  },
  distance: function(a, b) {
    return Math.sqrt(this.distanceSquared(a, b));
  },
  lengthSquared: function(a) {
    return a[0]*a[0] + a[1]*a[1] + a[2]*a[2];
  },
  length: function(a) {
    return Math.sqrt(this.lengthSquared(a));
  },
  setLength: function(target, l) {
    var length = this.length(target);
    if (length !== 0 && l !== length) {
      this.multiplyScalar(target, l / length);
    }
    return this;
  }
};

/**
 * @object Vector4
 * @author Matthew Wagerfield
 */
FSS.Vector4 = {
  create: function(x, y, z, w) {
    var vector = new FSS.Array(4);
    this.set(vector, x, y, z);
    return vector;
  },
  set: function(target, x, y, z, w) {
    target[0] = x || 0;
    target[1] = y || 0;
    target[2] = z || 0;
    target[3] = w || 0;
    return this;
  },
  setX: function(target, x) {
    target[0] = x || 0;
    return this;
  },
  setY: function(target, y) {
    target[1] = y || 0;
    return this;
  },
  setZ: function(target, z) {
    target[2] = z || 0;
    return this;
  },
  setW: function(target, w) {
    target[3] = w || 0;
    return this;
  },
  add: function(target, a) {
    target[0] += a[0];
    target[1] += a[1];
    target[2] += a[2];
    target[3] += a[3];
    return this;
  },
  multiplyVectors: function(target, a, b) {
    target[0] = a[0] * b[0];
    target[1] = a[1] * b[1];
    target[2] = a[2] * b[2];
    target[3] = a[3] * b[3];
    return this;
  },
  multiplyScalar: function(target, s) {
    target[0] *= s;
    target[1] *= s;
    target[2] *= s;
    target[3] *= s;
    return this;
  },
  min: function(target, value) {
    if (target[0] < value) { target[0] = value; }
    if (target[1] < value) { target[1] = value; }
    if (target[2] < value) { target[2] = value; }
    if (target[3] < value) { target[3] = value; }
    return this;
  },
  max: function(target, value) {
    if (target[0] > value) { target[0] = value; }
    if (target[1] > value) { target[1] = value; }
    if (target[2] > value) { target[2] = value; }
    if (target[3] > value) { target[3] = value; }
    return this;
  },
  clamp: function(target, min, max) {
    this.min(target, min);
    this.max(target, max);
    return this;
  }
};

/**
 * @class Color
 * @author Matthew Wagerfield
 */
FSS.Color = function(hex, opacity) {
  this.rgba = FSS.Vector4.create();
  this.hex = hex || '#FFa400';
  this.opacity = FSS.Utils.isNumber(opacity) ? opacity : 1;
  this.set(this.hex, this.opacity);
};

FSS.Color.prototype = {
  set: function(hex, opacity) {
    hex = hex.replace('#', '');
    var size = hex.length / 3;
    this.rgba[0] = parseInt(hex.substring(size*0, size*1), 16) / 255;
    this.rgba[1] = parseInt(hex.substring(size*1, size*2), 16) / 255;
    this.rgba[2] = parseInt(hex.substring(size*2, size*3), 16) / 255;
    this.rgba[3] = FSS.Utils.isNumber(opacity) ? opacity : this.rgba[3];
    return this;
  },
  hexify: function(channel) {
    var hex = Math.ceil(channel*255).toString(16);
    if (hex.length === 1) { hex = '0' + hex; }
    return hex;
  },
  format: function() {
    var r = this.hexify(this.rgba[0]);
    var g = this.hexify(this.rgba[1]);
    var b = this.hexify(this.rgba[2]);
    this.hex = '#' + r + g + b;
    return this.hex;
  }
};

/**
 * @class Object
 * @author Matthew Wagerfield
 */
FSS.Object = function() {
  this.position = FSS.Vector3.create();
};

FSS.Object.prototype = {
  setPosition: function(x, y, z) {
    FSS.Vector3.set(this.position, x, y, z);
    return this;
  }
};

/**
 * @class Light
 * @author Matthew Wagerfield
 */
FSS.Light = function(ambient, diffuse) {
  FSS.Object.call(this);
  this.ambient = new FSS.Color(ambient || '#FFFFFF');
  this.diffuse = new FSS.Color(diffuse || '#FFFFFF');
  this.ray = FSS.Vector3.create();
};

FSS.Light.prototype = Object.create(FSS.Object.prototype);

/**
 * @class Vertex
 * @author Matthew Wagerfield
 */
FSS.Vertex = function(x, y, z) {
  this.position = FSS.Vector3.create(x, y, z);
};

FSS.Vertex.prototype = {
  setPosition: function(x, y, z) {
    FSS.Vector3.set(this.position, x, y, z);
    return this;
  }
};

/**
 * @class Triangle
 * @author Matthew Wagerfield
 */
FSS.Triangle = function(a, b, c) {
  this.a = a || new FSS.Vertex();
  this.b = b || new FSS.Vertex();
  this.c = c || new FSS.Vertex();
  this.vertices = [this.a, this.b, this.c];
  this.u = FSS.Vector3.create();
  this.v = FSS.Vector3.create();
  this.centroid = FSS.Vector3.create();
  this.normal = FSS.Vector3.create();
  this.color = new FSS.Color();
  this.polygon = document.createElementNS(FSS.SVGNS, 'polygon');
  this.polygon.setAttributeNS(null, 'stroke-linejoin', 'round');
  this.polygon.setAttributeNS(null, 'stroke-miterlimit', '1');
  this.polygon.setAttributeNS(null, 'stroke-width', '1');
  this.computeCentroid();
  this.computeNormal();
};

FSS.Triangle.prototype = {
  computeCentroid: function() {
    this.centroid[0] = this.a.position[0] + this.b.position[0] + this.c.position[0];
    this.centroid[1] = this.a.position[1] + this.b.position[1] + this.c.position[1];
    this.centroid[2] = this.a.position[2] + this.b.position[2] + this.c.position[2];
    FSS.Vector3.divideScalar(this.centroid, 3);
    return this;
  },
  computeNormal: function() {
    FSS.Vector3.subtractVectors(this.u, this.b.position, this.a.position);
    FSS.Vector3.subtractVectors(this.v, this.c.position, this.a.position);
    FSS.Vector3.crossVectors(this.normal, this.u, this.v);
    FSS.Vector3.normalise(this.normal);
    return this;
  }
};

/**
 * @class Geometry
 * @author Matthew Wagerfield
 */
FSS.Geometry = function() {
  this.dirty = false;
  this.vertices = [];
  this.triangles = [];
  this.dirty = false;
 
    
};

FSS.Geometry.prototype = {
  update: function() {
    if (this.dirty) {
      var t,triangle;
      for (t = this.triangles.length - 1; t >= 0; t--) {
        triangle = this.triangles[t];
        triangle.computeCentroid();
        triangle.computeNormal();
      }
      this.dirty = false;
    }
    return this;
  }
};

/**
 * @class Plane
 * @author Matthew Wagerfield, modified by Maksim Surguy to implement Delaunay triangulation
 */
FSS.Plane = function(width, height, howmany) {
  FSS.Geometry.call(this);
  this.width = width || 100;
  this.height = height || 100;


  // Create an array of triangulated coordinates from our vertices
  //var triangles = Delaunay.triangulate(vertices);
    var triangles = JSON.parse(triz);
    var vertices = JSON.parse(vertz);

  for(i = triangles.length; i; ) {
    --i;
    var p1 = [Math.ceil(vertices[triangles[i]][0]), Math.ceil(vertices[triangles[i]][1])];
    --i;
    var p2 = [Math.ceil(vertices[triangles[i]][0]), Math.ceil(vertices[triangles[i]][1])];
    --i;
    var p3 = [Math.ceil(vertices[triangles[i]][0]), Math.ceil(vertices[triangles[i]][1])];

    t1 = new FSS.Triangle(new FSS.Vertex(p1[0],p1[1]), new FSS.Vertex(p2[0],p2[1]), new FSS.Vertex(p3[0],p3[1]));
    this.triangles.push(t1);
      
  }
};

FSS.Plane.prototype = Object.create(FSS.Geometry.prototype);
    

/**
 * @class Material
 * @author Matthew Wagerfield
 */
FSS.Material = function(ambient, diffuse) {
  this.ambient = new FSS.Color(ambient || '#FFa400');
  this.diffuse = new FSS.Color(diffuse || '#FFFFFF');
  this.slave = new FSS.Color();
};

/**
 * @class Mesh
 * @author Matthew Wagerfield
 */
FSS.Mesh = function(geometry, material) {
  FSS.Object.call(this);
  //this.geometry = geometry || new FSS.Geometry();
  this.geometry = geometry || new FSS.Geometry();
  this.material = material || new FSS.Material();
  this.side = FSS.FRONT;
  this.visible = true;
};

FSS.Mesh.prototype = Object.create(FSS.Object.prototype);

FSS.Mesh.prototype.update = function(lights, calculate) {
  var t,triangle, l,light, illuminance;

  // Update Geometry
  this.geometry.update();

  // Calculate the triangle colors
  if (calculate) {

    // Iterate through Triangles
    for (t = this.geometry.triangles.length - 1; t >= 0; t--) {
      triangle = this.geometry.triangles[t];

      // Reset Triangle Color
      FSS.Vector4.set(triangle.color.rgba);

      // Iterate through Lights
      for (l = lights.length - 1; l >= 0; l--) {
        light = lights[l];

        // Calculate Illuminance
        FSS.Vector3.subtractVectors(light.ray, light.position, triangle.centroid);
        FSS.Vector3.normalise(light.ray);
        illuminance = FSS.Vector3.dot(triangle.normal, light.ray);
        if (this.side === FSS.FRONT) {
          illuminance = Math.max(illuminance, 0);
        } else if (this.side === FSS.BACK) {
          illuminance = Math.abs(Math.min(illuminance, 0));
        } else if (this.side === FSS.DOUBLE) {
          illuminance = Math.max(Math.abs(illuminance), 0);
        }

        // Calculate Ambient Light
        FSS.Vector4.multiplyVectors(this.material.slave.rgba, this.material.ambient.rgba, light.ambient.rgba);
        FSS.Vector4.add(triangle.color.rgba, this.material.slave.rgba);

        // Calculate Diffuse Light
        FSS.Vector4.multiplyVectors(this.material.slave.rgba, this.material.diffuse.rgba, light.diffuse.rgba);
        FSS.Vector4.multiplyScalar(this.material.slave.rgba, illuminance);
        FSS.Vector4.add(triangle.color.rgba, this.material.slave.rgba);
      }

      // Clamp & Format Color
      FSS.Vector4.clamp(triangle.color.rgba, 0, 1);
    }
  }
  return this;
};

/**
 * @class Scene
 * @author Matthew Wagerfield
 */
FSS.Scene = function() {
    
  this.meshes = [];
  this.lights = [];
    
};

FSS.Scene.prototype = {
  add: function(object) {
    if (object instanceof FSS.Mesh && !~this.meshes.indexOf(object)) {
      this.meshes.push(object);
    } else if (object instanceof FSS.Light && !~this.lights.indexOf(object)) {
      this.lights.push(object);
    }
    return this;
  },
  remove: function(object) {
    if (object instanceof FSS.Mesh && ~this.meshes.indexOf(object)) {
      this.meshes.splice(this.meshes.indexOf(object), 1);
    } else if (object instanceof FSS.Light && ~this.lights.indexOf(object)) {
      this.lights.splice(this.lights.indexOf(object), 1);
    }
    return this;
  }
};

/**
 * @class Renderer
 * @author Matthew Wagerfield
 */
FSS.Renderer = function() {
  this.width = 0;
  this.height = 0;
  this.halfWidth = 0;
  this.halfHeight = 0;
};

FSS.Renderer.prototype = {
  setSize: function(width, height) {
    if (this.width === width && this.height === height) return;
    this.width = width;
    this.height = height;
    this.halfWidth = this.width * 0.5;
    this.halfHeight = this.height * 0.5;
    return this;
  },
  clear: function() {
    return this;
  },
  render: function(scene) {
    return this;
  }
};

/**
 * @class Canvas Renderer
 * @author Matthew Wagerfield
 */
FSS.CanvasRenderer = function() {
  FSS.Renderer.call(this);
  this.element = document.createElement('canvas');
  this.element.style.display = 'block';
  this.context = this.element.getContext('2d');
  this.setSize(this.element.width, this.element.height);
};

FSS.CanvasRenderer.prototype = Object.create(FSS.Renderer.prototype);

FSS.CanvasRenderer.prototype.setSize = function(width, height) {
  FSS.Renderer.prototype.setSize.call(this, width, height);
  this.element.width = width;
  this.element.height = height;
  this.context.setTransform(1, 0, 0, -1, this.halfWidth, this.halfHeight);
  return this;
};

FSS.CanvasRenderer.prototype.clear = function() {
  FSS.Renderer.prototype.clear.call(this);
  this.context.clearRect(-this.halfWidth, -this.halfHeight, this.width, this.height);
  return this;
};

FSS.CanvasRenderer.prototype.render = function(scene) {
  FSS.Renderer.prototype.render.call(this, scene);
  var m,mesh, t,triangle, color;

  // Clear Context
  this.clear();

  // Configure Context
  this.context.lineJoin = 'round';
  this.context.lineWidth = 1;

  // Update Meshes
  for (m = scene.meshes.length - 1; m >= 0; m--) {
    mesh = scene.meshes[m];
    if (mesh.visible) {
      mesh.update(scene.lights, true);

      // Render Triangles
      for (t = mesh.geometry.triangles.length - 1; t >= 0; t--) {
        triangle = mesh.geometry.triangles[t];
        color = triangle.color.format();
        this.context.beginPath();
        this.context.moveTo(triangle.a.position[0], triangle.a.position[1]);
        this.context.lineTo(triangle.b.position[0], triangle.b.position[1]);
        this.context.lineTo(triangle.c.position[0], triangle.c.position[1]);
        this.context.closePath();
        this.context.strokeStyle = color;
        this.context.fillStyle = color;
        this.context.stroke();
        this.context.fill();
      }
    }
  }
  return this;
};

 
/**
 * @class SVG Renderer
 * @author Matthew Wagerfield
 */
FSS.SVGRenderer = function() {
  FSS.Renderer.call(this);
  this.element = document.createElementNS(FSS.SVGNS, 'svg');
  this.element.setAttribute('xmlns', FSS.SVGNS);
  this.element.setAttribute('version', '1.1');
  this.element.style.display = 'block';
  this.setSize(300, 150);
};

FSS.SVGRenderer.prototype = Object.create(FSS.Renderer.prototype);

FSS.SVGRenderer.prototype.setSize = function(width, height) {
  FSS.Renderer.prototype.setSize.call(this, width, height);
  this.element.setAttribute('width', width);
  this.element.setAttribute('height', height);
  return this;
};

FSS.SVGRenderer.prototype.clear = function() {
  FSS.Renderer.prototype.clear.call(this);
  for (var i = this.element.childNodes.length - 1; i >= 0; i--) {
    this.element.removeChild(this.element.childNodes[i]);
  }
  return this;
};

FSS.SVGRenderer.prototype.render = function(scene) {
  FSS.Renderer.prototype.render.call(this, scene);
  var m,mesh, t,triangle, points, style;

  // Update Meshes
  for (m = scene.meshes.length - 1; m >= 0; m--) {
    mesh = scene.meshes[m];
    if (mesh.visible) {
      mesh.update(scene.lights, true);

      // Render Triangles
      for (t = mesh.geometry.triangles.length - 1; t >= 0; t--) {
        triangle = mesh.geometry.triangles[t];
        if (triangle.polygon.parentNode !== this.element) {
          this.element.appendChild(triangle.polygon);
        }
        points  = this.formatPoint(triangle.a)+' ';
        points += this.formatPoint(triangle.b)+' ';
        points += this.formatPoint(triangle.c);
        style = this.formatStyle(triangle.color.format());
        triangle.polygon.setAttributeNS(null, 'points', points);
        triangle.polygon.setAttributeNS(null, 'style', style);
      }
    }
  }
  return this;
};

FSS.SVGRenderer.prototype.formatPoint = function(vertex) {
  return (this.halfWidth+vertex.position[0])+','+(this.halfHeight-vertex.position[1]);
};

FSS.SVGRenderer.prototype.formatStyle = function(color) {
  var style = 'fill:'+color+';';
  style += 'stroke:'+color+';';
  return style;
};                  
                        
(function(){

  //------------------------------
  // Mesh Properties
  //------------------------------
      var MESH = {
        width: 3,
        height: 1,
        slices: 150,
        ambient: '#653700',
        diffuse: '#FFFF99'
      };

    if(typeof global_MESH.width != 'undefined') MESH.width = global_MESH.width;
    if(typeof global_MESH.height != 'undefined') MESH.height = global_MESH.height;
    if(typeof global_MESH.slices != 'undefined') MESH.slices = global_MESH.slices;
    if(typeof global_MESH.ambient != 'undefined') MESH.ambient = global_MESH.ambient;
    if(typeof global_MESH.diffuse != 'undefined') MESH.diffuse = global_MESH.diffuse;

  //------------------------------
  // Light Properties
  //------------------------------
      var LIGHT = {
        count: 1,
        xPos : 0,
        yPos : 200,
        zOffset: 10,
        ambient: '#FFa400',
        diffuse: '#FFcc00',
        pickedup :true,
        proxy : false,
        currIndex : 0
      };
       //console.log(' ****  I GOT lightz ****  == '  +  lightz );
    
    if(typeof global_LIGHT.count != 'undefined') LIGHT.count = global_LIGHT.count;
    if(typeof global_LIGHT.xPos != 'undefined') LIGHT.xPos = global_LIGHT.xPos;
    if(typeof global_LIGHT.yPos != 'undefined') LIGHT.yPos = global_LIGHT.yPos;
    if(typeof global_LIGHT.zOffset != 'undefined') LIGHT.zOffset = global_LIGHT.zOffset;
    if(typeof lightz != 'undefined') LIGHT.zOffset = lightz;
    if(typeof global_LIGHT.ambient != 'undefined') LIGHT.ambient = global_LIGHT.ambient;
    if(typeof global_LIGHT.diffuse != 'undefined') LIGHT.diffuse = global_LIGHT.diffuse;
    if(typeof global_LIGHT.pickedup != 'undefined') LIGHT.pickedup = global_LIGHT.pickedup;
    if(typeof global_LIGHT.proxy != 'undefined') LIGHT.proxy = global_LIGHT.proxy;
    if(typeof global_LIGHT.currIndex != 'undefined') LIGHT.currIndex = global_LIGHT.currIndex;
    
  //------------------------------
  // Render Properties
  //------------------------------
  //var WEBGL = 'webgl';
    
    
  var CANVAS = 'canvas';
  var SVG = 'svg';
    
var renderCHoice;
  var canvas2DSupported = !!window.CanvasRenderingContext2D;
     if (canvas2DSupported){
          //console.log('CANVAS IS SUPPORTED');
            renderCHoice = CANVAS;
         
      }else{
          //console.log('CANVAS IS NOT SUPPORTED, USE SVG');
          renderCHoice = SVG ;
    }
   // renderCHoice = SVG ;
    
    //console.log('Ccanvas2DSupported == '  +  canvas2DSupported);
  var RENDER = {
     renderer : renderCHoice
     
  };
    

  //------------------------------
  // Global Properties
  //------------------------------
  var center = FSS.Vector3.create();
  var container = document.getElementById('bWincontainer');
 // var report = document.getElementById('bWreport');
      var output = document.getElementById('bWinoutput');
  var renderer, scene, mesh, geometry, material;
  var webglRenderer, canvasRenderer, svgRenderer;
  var gui;
    var hasTilt = false;

  //------------------------------
  // Methods
  //------------------------------
  function initialise() {
      
      //console.log('&*&*&*&* HAS initialise &*&*&*&*&');
    createRenderer();
    createScene();
    createMesh();
    addLight();
    addEventListeners();
    resize(container.offsetWidth, container.offsetHeight);
    animate();

  }

  function createRenderer() {
   // webglRenderer = new FSS.WebGLRenderer();
    canvasRenderer = new FSS.CanvasRenderer();
      //console.log('createRenderer: RENDER.renderer = ' +  RENDER.renderer);
    svgRenderer = new FSS.SVGRenderer();
      
    //  RENDER.renderer = 'svg';
    setRenderer(RENDER.renderer);
  }

  function setRenderer(index) {
    if (renderer) {
      output.removeChild(renderer.element);
    }

    switch(index) {

      case CANVAS:
        renderer = canvasRenderer;
        break;
      case SVG:
        renderer = svgRenderer;
            //console.log('SHIT I DELETED TEH SVG RENDERER');
        break;
    }
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    output.appendChild(renderer.element);
  }

  function createScene() {
    scene = new FSS.Scene();
  }

  function createMesh() {
    scene.remove(mesh);
    renderer.clear();
    geometry = new FSS.Plane(MESH.width * renderer.width, MESH.height * renderer.height, MESH.slices);
      
    //console.log('geometry == ' + geometry); 

       
    material = new FSS.Material(MESH.ambient, MESH.diffuse);
    mesh = new FSS.Mesh(geometry, material);
    //console.log(JSON.stringify(mesh) );  
      
    scene.add(mesh);
  }

  // Add a single light
  function addLight() {
    renderer.clear();
    light = new FSS.Light(LIGHT.ambient, LIGHT.diffuse);
    light.ambientHex = light.ambient.format();
    light.diffuseHex = light.diffuse.format();
    light.setPosition(LIGHT.xPos, LIGHT.yPos, LIGHT.zOffset);
    scene.add(light);
    LIGHT.proxy = light;
    LIGHT.pickedup = true;
    LIGHT.currIndex++;
  }

  // Remove lights 
  function trimLights(value) {
    LIGHT.proxy = scene.lights[value];
    for (l = value; l >= scene.lights.length - 1; l--) {
      light = scene.lights[l];
      scene.remove(light);
    }
    renderer.clear();
  }

  // Resize canvas
  function resize(width, height) {
    renderer.setSize(width, height);
    FSS.Vector3.set(center, renderer.halfWidth, renderer.halfHeight);
    createMesh();
  }

  function animate() {
    render();
    requestAnimationFrame(animate);
  }

  function render() {
    renderer.render(scene);
  }

  function addEventListeners() {
      //console.log('**** addEventListeners **** from int ')
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
 
      
      if (window.DeviceOrientationEvent) {
          hasTilt= true;
          window.addEventListener('deviceorientation', function(eventData) {
          // gamma is the left-to-right tilt in degrees, where right is positive
          var tiltLR = eventData.gamma;
          
          // beta is the front-to-back tilt in degrees, where front is positive
          var tiltFB = eventData.beta;
          
          // alpha is the compass direction the device is facing in degrees
          var dir = eventData.alpha
         
          // call our orientation event handler
          deviceOrientationHandler(tiltLR, tiltFB, dir);
          }, false);
      } else {
           hasTilt= false;
          //console.log("NO TILT DEVICE FOUND");
      }
      
  }
    
    var last_orientation = true;
    var main_gamma = 0;
    var main_beta = 0;
    var init = 0;
    
  function deviceOrientationHandler(gamma, beta, alpha)
    {  
        if(typeof horisontal_sensitivity == 'undefined') horisontal_sensitivity = 1.6;
        if(typeof verical_sensitivity == 'undefined') verical_sensitivity = 1.6;
        
        if(LIGHT.pickedup)
        {
            var orientation = ori();
            var xpos = 0;
            var ypos = 0;
            
            if( init == 0 )
            {
                init++;
                main_gamma = gamma;
                main_beta = beta;
            }
            
            if( last_orientation != orientation )
            {
                main_gamma = gamma;
                main_beta = beta;
                last_orientation = orientation;
                setTimeout(function(){ zeroZero(); }, 300);
            }
           
            if( orientation == true )
            {
                //portrait
                xpos += (main_gamma-gamma)*pHorizontal_sensitivity;
                ypos -= (main_beta-beta)*pVertical_sensitivity;
            }
            else
            {
                //landscape
                ypos -= (main_gamma-gamma)*lVertical_sensitivity;
                xpos += (main_beta-beta)*lHorizontal_sensitivity;
            }
            
            
            function zeroZero() {
               // wait to reset center (phone still moving)
                main_gamma = gamma;
                main_beta = beta;
                //last_orientation = orientation;
                
            }
            
            function ori()
                { 
                    if(window.outerWidth > window.outerHeight)
                    {
                        return false;
                    }
                    else 
                    {
                        return true;
                    };
                }

            var wdht = document.getElementById('bWincontainer').offsetWidth/ 2 ;
            var hght = document.getElementById('bWincontainer').offsetHeight/ 2;
            
            if( xpos > wdht ) xpos = wdht;
            if( xpos < -1*wdht ) xpos = (-1*wdht);
            
            if( ypos > hght ) ypos = hght;
            if( ypos < -1*hght ) ypos = -1*hght;
            
            LIGHT.proxy.setPosition(xpos, ypos, LIGHT.proxy.position[2]);
            
          //  report.textContent = wdht;
        } 
    }

  //------------------------------
  // Callbacks
  //------------------------------

  function onWindowResize(event) {
 
  }

  function onMouseMove(event) {
    if(LIGHT.pickedup){

	var posx = 0;
	var posy = 0;

	if (!e) var e = window.event;

    //console.log(e);
        
	if (e.pageX || e.pageY)
	{
		posx = e.pageX - container.parentNode.offsetLeft;
		posy = e.pageY - container.parentNode.offsetTop;
	}
	else if (e.clientX || e.clientY) 
	{
		posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - container.parentNode.offsetLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - container.parentNode.offsetTop;
	}

//console.log(posx,posy);
    LIGHT.xPos = posx - renderer.width/2;
    LIGHT.yPos = renderer.height/2 -posy;
        
    if( LIGHT.xPos > (document.getElementById('bWincontainer').offsetWidth / 2) )
        LIGHT.xPos = document.getElementById('bWincontainer').offsetWidth / 2;
        
    if( LIGHT.yPos < -1*(document.getElementById('bWincontainer').offsetHeight ) )
        LIGHT.yPos = -1*document.getElementById('bWincontainer').offsetHeight ;
             
    LIGHT.proxy.setPosition(LIGHT.xPos, LIGHT.yPos, LIGHT.proxy.position[2]);
     
    } 
  }

   initialise();

})();
 
}
 
var w;
var h;

window.addEventListener('load',function(){
    w = '320';
    h = '50';
    
    //console.log('BANNER WIDTH =========== '  + w);
    //console.log('BANNER HEIGHT =========== '  + h);
    var bann = document.getElementById('bWinbanner');
    var con = document.getElementById('bWincontainer');
    bann.style.width= w;
    bann.style.height= h;
    con.style.width= w;
    con.style.height= h;
   var polyFetch ='https://ma.itsfogo.com/bw/assets/poly/yell/poly'+w+'x'+h+'.js';
    //  var polyFetch ='//ma.itsfogo.com/bw/assets/poly/yell/poly320x50.js';
    
 function loadJS(src, callback) {
    var s = document.createElement('script');
     s.setAttribute("type","text/javascript");
      
    s.src = src;
    s.async = true;
    s.onreadystatechange = s.onload = function() {
        var state = s.readyState;
        if (!callback.done && (!state || /loaded|complete/.test(state))) {
            callback.done = true;
            callback();
        }
    };
    document.getElementsByTagName('head')[0].appendChild(s);
}
    
    
loadJS(polyFetch, function() { 
    // put your code here to run after script is loaded
    //console.log(' &*&*&* FINISHED LOADING   *&*&*  = '  + polyFetch  );
    loadGold(w,h);
});
    

});