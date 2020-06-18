/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line import/no-unresolved
import Tweakpane from 'tweakpane';
import {
  isObject,
  isColor,
  isVector3,
  isVector2,
  isVector4,
  isNumber,
} from '../type';

let pane;
let index = 0;

export const createUniformsPane = (uniforms, opts = {}) => {
  if (!isObject(uniforms)) return {};
  const { title = null, width = 256 } = opts;
  if (!pane) {
    pane = new Tweakpane();
    pane.element.parentElement.style.width = `${width}px`;
  }
  const folder = pane.addFolder({ title: title || `program n°${index}` });

  Object.keys(uniforms).forEach((key) => {
    const { value, useMonitor = false, isStatic = false, ...params } = uniforms[
      key
    ];

    if (isStatic) return;

    const type = [isNumber, isVector2, isVector3, isVector4, isColor].reduce(
      (acc, fn, i) => acc + (fn(uniforms[key].value) ? i + 1 : 0),
      0,
    );

    switch (type) {
      case 5: {
        Object.assign(uniforms[key], {
          alias: {
            r: uniforms[key].value.r * 255,
            g: uniforms[key].value.g * 255,
            b: uniforms[key].value.b * 255,
          },
        });

        folder.addInput(uniforms[key], 'alias', {
          label: key,
          ...params,
        }).on('change', () => {
          uniforms[key].value.set(
            Object.values(uniforms[key].alias).map((val) => val / 255),
          );
        });
        break;
      }
      case 4: {
        const { x, y, z, w } = params;

        Object.assign(uniforms[key], {
          aliasXY: {
            x: uniforms[key].value.x,
            y: uniforms[key].value.y,
          },
          aliasZW: {
            x: uniforms[key].value.z,
            y: uniforms[key].value.w,
          },
        });

        const configXY = {
          label: `${key} xy`,
          x,
          y,
        };

        const configZW = {
          label: `${key} zw`,
          x: z,
          y: w,
        };

        folder.addInput(uniforms[key], 'aliasXY', configXY).on('change', () => {
          uniforms[key].value.set(
            ...Object.values(uniforms[key].aliasXY),
            ...Object.values(uniforms[key].aliasZW),
          );
        });

        folder.addInput(uniforms[key], 'aliasZW', configZW).on('change', () => {
          uniforms[key].value.set(
            ...Object.values(uniforms[key].aliasXY),
            ...Object.values(uniforms[key].aliasZW),
          );
        });
        break;
      }
      case 3: {
        const { x, y, z } = params;

        Object.assign(uniforms[key], {
          aliasXY: {
            x: uniforms[key].value.x,
            y: uniforms[key].value.y,
          },
        });

        const configXY = {
          label: `${key} xy`,
          x,
          y,
        };

        folder.addInput(uniforms[key], 'aliasXY', configXY).on('change', () => {
          uniforms[key].value.set(
            ...Object.values(uniforms[key].aliasXY),
            uniforms[key].value,
          );
        }).addInput(uniforms[key].value, 'z', {
          label: `${key} z`,
          ...z,
        });
        break;
      }
      case 2: {
        const { x, y } = params;
        Object.assign(uniforms[key], {
          aliasXY: {
            x: uniforms[key].value.x,
            y: uniforms[key].value.y,
          },
        });

        const configXY = {
          label: key,
          x,
          y,
        };
        folder.addInput(uniforms[key], 'aliasXY', configXY).on('change', () => {
          uniforms[key].value.set(...Object.values(uniforms[key].aliasXY));
        });
        break;
      }
      case 1: {
        folder[useMonitor ? 'addMonitor' : 'addInput'](uniforms[key], 'value', {
          label: key,
          ...params,
        });
        break;
      }
      default:
        console.log('default');
    }
  });
  index++;
  return () => {
    folder.dispose();
    index--;
  };
};
