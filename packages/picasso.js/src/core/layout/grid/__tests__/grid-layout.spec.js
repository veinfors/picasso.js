// import gridLayout from '..';
// import createRect from '../../dock/create-rect';

describe('Grid Layout', () => {
  // const componentMock = function componentMock({
  //   size = 0,
  //   show = true
  // } = {}) {
  //   const dummy = {};

  //   dummy.settings = {
  //     show
  //   };

  //   dummy.preferredSize = () => ({ width: size, height: size });

  //   let outerRect = createRect();
  //   let innerRect = createRect();
  //   dummy.resize = function resize(...args) {
  //     [innerRect, outerRect] = args;
  //   };

  //   Object.defineProperties(dummy, {
  //     rect: {
  //       get: () => innerRect
  //     },
  //     outer: {
  //       get: () => outerRect
  //     }
  //   });

  //   return dummy;
  // };

  describe('Layout', () => {
    // let rect;
    // let gl;

    // beforeEach(() => {
    //   rect = createRect(0, 0, 1000, 1000);
    //   gl = gridLayout();
    // });

    // it('should handle empty components array in layout call', () => {
    //   const { visible, hidden } = gl.layout(rect);
    //   expect(visible).to.be.an('array').that.is.empty;
    //   expect(hidden).to.be.an('array').that.is.empty;
    // });

    // it('should throw exception if rect is invalid', () => {
    //   const fn = () => {
    //     gl.layout(null, [componentMock()]);
    //   };
    //   expect(fn).to.throw('Invalid rect');
    // });

    // it('should set correct component rects', () => {
    //   const components = [
    //     componentMock({ size: 50 }),
    //     componentMock({ size: 100 }),
    //     componentMock({ size: 150 }),
    //     componentMock({ size: 200 })
    //   ];

    //   gl.layout(rect, components);
    // });
  });
});
